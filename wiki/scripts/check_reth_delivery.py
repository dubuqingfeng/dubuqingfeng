#!/usr/bin/env python3
"""Check the exact Reth delivery set without changing any frozen evidence."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from check_reth_wiki import enumerate_sources, EXTERNAL_STATIC_DRIFT, NAV

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', type=Path, default=ROOT / 'wiki/plans/reth-final-manifest.json')
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    baseline = json.loads((ROOT / 'wiki/plans/reth-baseline-initial.json').read_text())
    current = enumerate_sources()
    rows = {row['file']: row for row in manifest['files']}
    assert len(rows) == len(manifest['files'])
    for name, row in rows.items():
        assert current[name] == row['sha256'], name
        assert row['kind'] == ('modified' if name in baseline['sourceFiles'] else 'added'), name
    assert {name for name in rows if name in baseline['sourceFiles']} == {NAV}
    external = {row['file']: row for row in manifest['externalFiles']}
    for name, old_hash in baseline['sourceFiles'].items():
        assert name in current, ('Old source removed', name)
        if name == NAV:
            assert rows[name]['beforeSha256'] == old_hash
        elif name in external:
            assert external[name]['taskInitialSha256'] == old_hash
            if current[name] != external[name]['atFreezeSha256']:
                assert name in EXTERNAL_STATIC_DRIFT, name
        else:
            assert current[name] == old_hash, ('Unapproved old source change', name)
    external_additions = set(external) - set(baseline['sourceFiles'])
    assert external_additions == set(manifest['externalAdditionsAtFreeze'])
    assert external_additions <= {
        'wiki/static/html-pages/blockchain/parallel-execution/index.html',
        'wiki/static/html-pages/blockchain/parallel-execution/style.css',
        'wiki/static/html-pages/blockchain/parallel-execution/app.js',
        'wiki/static/html-pages/solana/bank/index.html',
        'wiki/static/html-pages/solana/bank/style.css',
        'wiki/static/html-pages/solana/bank/app.js',
    }
    for name in external_additions:
        if current[name] != external[name]['atFreezeSha256']:
            assert name in EXTERNAL_STATIC_DRIFT or name in {'wiki/static/html-pages/solana/bank/index.html', 'wiki/static/html-pages/solana/bank/style.css', 'wiki/static/html-pages/solana/bank/app.js'}, name
    expected_new = (set(rows) - set(baseline['sourceFiles'])) | external_additions | {str(args.manifest.resolve().relative_to(ROOT))}
    assert set(current) - set(baseline['sourceFiles']) == expected_new, {
        'unexpected': sorted(set(current) - set(baseline['sourceFiles']) - expected_new),
        'missing': sorted(expected_new - set(current)),
    }
    staged = hashlib.sha256(subprocess.check_output(['git', 'diff', '--cached', '--raw', '-z'], cwd=ROOT)).hexdigest()
    assert staged == baseline['stagedRawDiffSha256'] == manifest['stagedRawDiffSha256']
    print(json.dumps(dict(status='passed', deliveryFiles=len(rows), exactOldSourceFiles=len(baseline['sourceFiles']),
                         onlyOwnOldChange=NAV, explicitlyExternalFiles=len(external),
                         stagedRawDiffSha256=staged,
                         manifestSha256=hashlib.sha256(args.manifest.read_bytes()).hexdigest()), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
