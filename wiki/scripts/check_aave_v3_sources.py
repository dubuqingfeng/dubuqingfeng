#!/usr/bin/env python3
"""Check the article's fixed source links and compilation source hashes against Git objects."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

COMMIT = 'cff15de6d1271b0c800fc001f4aea4c263e8a597'


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    source = args.source_dir.resolve()
    site = Path(__file__).resolve().parents[1]
    assert git(source, 'rev-parse', 'HEAD').decode().strip() == COMMIT
    article = (site/'docs/wiki/blockchain/defi/aave/v3-borrow-health-factor.md').read_text()
    pattern = r'https://github.com/aave-dao/aave-v3-origin/blob/'+COMMIT+r'/([^\s)]+)'
    links = sorted(set(re.findall(pattern, article)))
    assert links
    references = []
    for link in links:
        file, _, fragment = link.partition('#')
        content = git(source, 'show', COMMIT+':'+file)
        assert (source/file).read_bytes() == content
        if fragment:
            match = re.fullmatch(r'L(\d+)(?:-L(\d+))?', fragment)
            assert match, fragment
            start, end = int(match[1]), int(match[2] or match[1])
            assert 1 <= start <= end <= len(content.splitlines()), (file, fragment, len(content.splitlines()))
        references.append({'reference':link,'sha256':hashlib.sha256(content).hexdigest()})
    compiled = json.loads((site/'static/examples/aave-v3-borrow/compilation.json').read_text())
    rows = []
    for file, expected in compiled['sourceSha256'].items():
        if file == 'Fixture.sol':
            actual = (site/'static/examples/aave-v3-borrow/Fixture.sol').read_bytes()
        else:
            target = source/file
            root = git(target.parent, 'rev-parse', '--show-toplevel').decode().strip()
            rel = target.resolve().relative_to(Path(root).resolve()).as_posix()
            actual = git(root, 'show', 'HEAD:'+rel)
            assert target.read_bytes() == actual
        assert hashlib.sha256(actual).hexdigest() == expected, file
        rows.append({'file':file,'sha256':expected})
    result = {'status':'passed','commit':COMMIT,'referencesChecked':len(references),'sourceFilesReferenced':len({r['reference'].split('#')[0] for r in references}),'references':references,'compilationUnitsCheckedAgainstGit':len(rows),'compilationUnits':rows,'scope':'Local Git objects at fixed commit and pinned submodules; no deployed mainnet comparison'}
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS:',len(references),'fixed references;',len(rows),'compilation source units')


if __name__ == '__main__':
    main()
