#!/usr/bin/env python3
"""Run frozen legacy HTML checks without pretending old freeze assertions accept new navigation.
Solana adapter changes only two hard-coded paths. Hyperliquid runs the unmodified
full command, then its original main statements before the freeze-baseline assignment.
The separate #7 checker verifies every original scope/staging condition with an explicit allowlist.
"""
import argparse
import ast
import copy
import hashlib
import json
import subprocess
import sys
from pathlib import Path


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--build-dir',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    args=parser.parse_args();site=Path(__file__).resolve().parents[1];root=site.parent
    out=args.output_dir.resolve();out.mkdir(parents=True,exist_ok=True);build=args.build_dir.resolve()
    baseline=json.loads((site/'plans/blockchain-navigation-baseline.json').read_text())
    # Ephemeral first-article checker is preserved verbatim so its adapter is reviewable.
    original=site/'plans/blockchain-navigation-solana-original.py'
    source=original.read_text()
    oldroot="root=Path('/Volumes/SolanaCaseCheck/wiki-compatible-build')"
    oldout="Path('/tmp/wiki-compatible-solana-html.json')"
    assert source.count(oldroot)==source.count(oldout)==1
    adapted=source.replace(oldroot,'root=Path('+repr(str(build))+')').replace(oldout,'Path('+repr(str(out/'blockchain-navigation-solana-links.json'))+')')
    adapter=out/'blockchain-navigation-solana-adapted.py';adapter.write_text(adapted)
    r=subprocess.run([sys.executable,str(adapter)],cwd=root,text=True,capture_output=True)
    (out/'blockchain-navigation-solana-check.log').write_text(r.stdout+r.stderr)
    assert r.returncode==0,r.stderr
    # Full original Hyperliquid run must fail specifically at the first known navigation hash.
    script=site/'scripts/check_hyperliquid_orders.py';oldsha=baseline['sourceFiles'][str(script.relative_to(root))]
    assert hashlib.sha256(script.read_bytes()).hexdigest()==oldsha
    cmd=[sys.executable,str(script),'--build-dir',str(build),'--output',str(out/'blockchain-navigation-hyperliquid-full-unused.json')]
    r=subprocess.run(cmd,cwd=root,text=True,capture_output=True)
    (out/'blockchain-navigation-hyperliquid-full.log').write_text(r.stdout+r.stderr)
    old=json.loads((site/'plans/hyperliquid-orders-baseline.json').read_text())
    mismatches=[f for f,sha in old['files'].items() if hashlib.sha256((root/f).read_bytes()).hexdigest()!=sha]
    allowed=set(baseline['allowedNavigationChanges'])
    assert mismatches and set(mismatches)<=allowed,mismatches
    assert r.returncode==1 and 'AssertionError: '+mismatches[0] in r.stderr,r.stderr
    assert "baseline['files'].items()" in r.stderr,r.stderr
    # Keep every original import and every main statement before baseline assignment, including assertions.
    module=ast.parse(script.read_text(),filename=str(script));fn=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='main')
    stop=next(i for i,n in enumerate(fn.body) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='baseline' for t in n.targets))
    last=fn.body[stop-1].end_lineno
    extra=ast.parse('''
result=dict(status='passed',scope='Original Hyperliquid HTML/resources only; legacy freeze/staging conditions checked separately by #7',originalCheckerSha256=ORIGINAL_SHA,executedMainThroughLine=LAST_LINE,eightOldRoutesAndTitles='passed',eightSectionIds='passed',localLinksAndImagesChecked=len(checked),assets=assets,externalCollectedNotLiveChecked=sorted(external))
args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2))
print('PASS original Hyperliquid HTML/resources:',len(checked),'links,',len(assets),'downloads; freeze conditions not executed in this prefix')
''').body
    fn.body=fn.body[:stop]+extra
    ast.fix_missing_locations(module)
    oldargv=sys.argv[:];sys.argv=[str(script),'--build-dir',str(build),'--output',str(out/'blockchain-navigation-hyperliquid-html.json')]
    try:exec(compile(module,str(script),'exec'),dict(__file__=str(script),__name__='__main__',ORIGINAL_SHA=oldsha,LAST_LINE=last))
    finally:sys.argv=oldargv
    report=dict(status='passed',solana=dict(originalSha256=hashlib.sha256(original.read_bytes()).hexdigest(),adapterBindingsOnly=['root','output path'],returncode=0),
                hyperliquid=dict(originalCheckerSha256=oldsha,fullCommand=cmd,fullReturncode=r.returncode,fullOutcome='expected failure; not a full-check pass',allLegacyBaselineMismatches=mismatches,originalHtmlPrefixThroughLine=last,htmlResourceAssertions='passed',remainingProtectionChecks='required separately in check_blockchain_navigation.py'))
    (out/'blockchain-navigation-prior-adapters.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS adapters: Solana original assertions; Hyperliquid original full failure precisely scoped and HTML prefix passes')


if __name__=='__main__':main()
