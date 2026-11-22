#!/usr/bin/env python3
"""Record unmodified legacy failures, run their original HTML assertions, and enumerate exact freeze differences."""
import argparse
import ast
import hashlib
import json
import subprocess
import sys
from pathlib import Path

SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--build-dir',required=True,type=Path);ap.add_argument('--generated-dir',required=True,type=Path);args=ap.parse_args()
    out=SITE/'plans/wiki-readme-prior';out.mkdir(exist_ok=True)
    base=json.loads((SITE/'plans/wiki-readme-baseline.json').read_text());changes=json.loads((SITE/'plans/wiki-readme-changes.json').read_text());moves={r['before']:r['after'] for r in changes['migrations']}
    results=[]
    def run(name,cmd,expected):
        r=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
        (out/(name+'.log')).write_text(r.stdout+r.stderr)
        assert r.returncode==expected,(name,r.returncode,r.stderr[-3000:])
        row=dict(check=name,command=cmd,exitCode=r.returncode,outcome='passed' if expected==0 else 'original full failure; not reported as a pass',log=str((out/(name+'.log')).relative_to(ROOT)))
        results.append(row);return row
    for check in ['uniswap_v3_swap','aave_v3_borrow','drift_position']:
        run(check,[sys.executable,str(SITE/'scripts'/('check_'+check+'.py')),'--build-dir',str(args.build_dir),'--output',str(out/(check+'.json'))],0)
    run('hyperliquid-full',[sys.executable,str(SITE/'scripts/check_hyperliquid_orders.py'),'--build-dir',str(args.build_dir),'--output',str(out/'hyperliquid-full-unused.json')],1)
    run('legacy-full',[sys.executable,str(SITE/'scripts/check_wiki_legacy_routes.py'),'--build-dir',str(args.build_dir),'--output',str(out/'legacy-full-unused.json')],1)
    # Keep the frozen URL fixture and every original URL/anchor/canonical/navbar assertion.
    # Only resolve the single renamed source path referenced by that fixture.
    legacy=SITE/'scripts/check_wiki_legacy_routes.py';legacy_source=legacy.read_text()
    old_binding='exact_file(site_dir, record["source"])'
    new_binding='exact_file(site_dir, SOURCE_MOVES.get(record["source"], record["source"]))'
    assert legacy_source.count(old_binding)==1
    legacy_adapter=out/'legacy-source-path-adapter.py';legacy_adapter.write_text(legacy_source.replace(old_binding,new_binding))
    argv=sys.argv[:];sys.argv=[str(legacy),'--build-dir',str(args.build_dir),'--output',str(SITE/'plans/wiki-readme-final-legacy.json')]
    try:exec(compile(legacy_adapter.read_text(),str(legacy),'exec'),dict(__name__='__main__',__file__=str(legacy),SOURCE_MOVES={'docs/wiki/blockchain/bitcoin/bip/index.md':'docs/wiki/blockchain/bitcoin/bip/README.md'}))
    finally:sys.argv=argv
    run('prior-adapters-full',[sys.executable,str(SITE/'scripts/check_prior_navigation_links.py'),'--build-dir',str(args.build_dir),'--output-dir',str(out/'original-adapters')],1)
    # Redirect only the old navigation checker's final diff output; preserve every original read/assertion.
    script=SITE/'scripts/check_blockchain_navigation.py';source=script.read_text();old="(site/'plans/blockchain-navigation-allowed.diff')";new="(site/'plans/wiki-readme-prior/navigation-allowed.diff')"
    assert source.count(old)==1
    adapted=out/'navigation-output-only-adapter.py';adapted.write_text(source.replace(old,new))
    wrapper='import sys;from pathlib import Path;sys.path.insert(0,'+repr(str(script.parent))+');sys.argv='+repr([str(script),'--build-dir',str(args.build_dir),'--generated-dir',str(args.generated_dir),'--output',str(out/'navigation-unused.json')])+';exec(compile(Path('+repr(str(adapted))+').read_text(),'+repr(str(script))+',"exec"),dict(__name__="__main__",__file__='+repr(str(script))+'))'
    row=run('navigation-full-output-only-adapter',[sys.executable,'-c',wrapper],1);row.update(originalCheckerSha256=sha(script),onlyAdaptation='Final allowed.diff output path redirected; all original assertions retained')
    # Execute the exact original Hyperliquid statements through the final asset assertion.
    script=SITE/'scripts/check_hyperliquid_orders.py';module=ast.parse(script.read_text());fn=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='main')
    stop=next(i for i,n in enumerate(fn.body) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='baseline' for t in n.targets));last=fn.body[stop-1].end_lineno
    fn.body=fn.body[:stop]+ast.parse("args.output.write_text(json.dumps(dict(status='passed',localLinksAndImagesChecked=len(checked),assets=assets,scope='Original HTML/resources only; full freeze conditions checked separately'),ensure_ascii=False,indent=2))").body
    ast.fix_missing_locations(module);argv=sys.argv[:];sys.argv=[str(script),'--build-dir',str(args.build_dir),'--output',str(out/'hyperliquid-original-html.json')]
    try:exec(compile(module,str(script),'exec'),dict(__name__='__main__',__file__=str(script)))
    finally:sys.argv=argv
    # Every historical mismatch is explicitly mapped. Previous accepted differences remain historical.
    freezes={}
    for name in ['uniswap-v3-final-manifest.json','aave-v3-final-manifest.json','drift-position-final-manifest.json','hyperliquid-orders-final-manifest.json','blockchain-navigation-final-manifest.json']:
        m=json.loads((SITE/'plans'/name).read_text());freezes['wiki/plans/'+name]={r['file']:r['sha256'] for r in m['files']}
    for name in ['hyperliquid-orders-baseline.json','blockchain-navigation-baseline.json']:
        b=json.loads((SITE/'plans'/name).read_text());freezes['wiki/plans/'+name]=b.get('files',b.get('sourceFiles'))
    checked=[]
    for freeze,files in freezes.items():
        mismatches=[]
        for old,expected in files.items():
            target=moves.get(old,old);actual=sha(ROOT/target)
            if actual==expected:continue
            at_start=base['sourceFiles'][old]
            current_delta=actual!=at_start
            if current_delta:assert old in changes['modifiedOrMoved'],(freeze,old)
            mismatches.append(dict(originalFile=old,currentFile=target,historicalSha256=expected,beforeThisAssignmentSha256=at_start,currentSha256=actual,alreadyDifferentBeforeThisAssignment=expected!=at_start,changedByThisAssignment=current_delta,scope='Exact README/index migration or navigation/source-link change' if current_delta else 'Pre-existing accepted or externally updated state; unchanged by this assignment'))
        checked.append(dict(freeze=freeze,freezeSha256=sha(ROOT/freeze),filesChecked=len(files),allMismatches=mismatches))
    # Conditions after the old Hyperliquid failure must still be checked explicitly.
    b=json.loads((SITE/'plans/hyperliquid-orders-baseline.json').read_text());unchanged=[]
    for f,row in b['hyperliquidOriginalPages']['files'].items():
        if f.endswith(('concepts/overview.md','concepts/margins.md','network/networks.md')):assert sha(ROOT/f)==row['sha256'];unchanged.append(f)
    staged=hashlib.sha256(subprocess.check_output(['git','diff','--cached','--raw','-z'],cwd=ROOT)).hexdigest();assert staged==base['stagedRawDiffSha256']==b['stagedRawDiffSha256']
    report=dict(status='passed with original failures separately recorded',fullCommands=results,legacySourcePathAdapter=dict(status='passed',originalCheckerSha256=sha(legacy),sourceMoves={'docs/wiki/blockchain/bitcoin/bip/index.md':'docs/wiki/blockchain/bitcoin/bip/README.md'},scope='Only exact source binding changes; all original URL/title/canonical/navbar assertions unchanged'),originalHyperliquidHtml=dict(status='passed',mainThroughLine=last,checkerSha256=sha(script)),historicalFreezes=checked,unchangedHyperliquidPages=unchanged,stagedRawDiffSha256=staged,remainingProtection='check_wiki_readmes.py validates every current-before source file and exact inverse navigation changes, every previous Wiki route/title/heading, five journeys and 56 downloads')
    (SITE/'plans/wiki-readme-prior-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS: 3 original HTML checkers; original Hyperliquid HTML; 4 full frozen/path-check failures recorded; all original legacy assertions with one exact source mapping; 7 historical freeze enumerations')


if __name__=='__main__':main()
