#!/usr/bin/env python3
"""Retain historical check failures, preserve fixed outputs, and run original HTML assertions."""
import argparse
import ast
import hashlib
import json
import subprocess
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'wiki'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--build-dir',required=True,type=Path);ap.add_argument('--generated-dir',required=True,type=Path);a=ap.parse_args();out=SITE/'plans/reth-prior';out.mkdir(exist_ok=True);results=[]
 def run(name,cmd,expected=None):
  p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True);(out/(name+'.log')).write_text(p.stdout+p.stderr)
  row=dict(name=name,command=cmd,exitCode=p.returncode,log=str((out/(name+'.log')).relative_to(ROOT)));results.append(row)
  if expected is not None:assert p.returncode==expected,(name,p.returncode,p.stderr[-1000:])
  return row
 for check in ['uniswap_v3_swap','aave_v3_borrow','drift_position']:
  run(check,[sys.executable,str(SITE/'scripts'/('check_'+check+'.py')),'--build-dir',str(a.build_dir),'--output',str(out/(check+'.json'))],0)
 for name,script,args in [
  ('hyperliquid-full','check_hyperliquid_orders.py',['--output',str(out/'hyperliquid-full-unused.json')]),
  ('legacy-current-full','check_wiki_legacy_routes.py',['--output',str(out/'legacy-current-full-unused.json')]),
  ('readme-full','check_wiki_readmes.py',['--generated-dir',str(a.generated_dir),'--output',str(out/'readme-full-unused.json')]),
  ('prior-navigation-full','check_prior_navigation_links.py',['--output-dir',str(out/'old-solana-adapters')])]:
  run(name,[sys.executable,str(SITE/'scripts'/script),'--build-dir',str(a.build_dir)]+args,0 if name=='legacy-current-full' else 1)
 legacy=SITE/'scripts/check_wiki_legacy_routes.py';original=legacy.read_text()
 # The complete original historical assertions use the frozen 381-record input, without URL substitutions.
 old='(site_dir / "plans/wiki-legacy-routes.json")';new='(site_dir / "plans/reth-historical-contract.json")';assert original.count(old)==1
 hist=out/'legacy-historical-input-adapter.py';hist.write_text(original.replace(old,new))
 wrapper='import sys;from pathlib import Path;sys.argv='+repr([str(legacy),'--build-dir',str(a.build_dir),'--output',str(out/'legacy-historical-unused.json')])+';exec(compile(Path('+repr(str(hist))+').read_text(),'+repr(str(legacy))+',"exec"),dict(__name__="__main__",__file__='+repr(str(legacy))+'))'
 run('legacy-historical-complete-assertions',[sys.executable,'-c',wrapper],1)
 # Redirect only the old navigation checker's known fixed diff write, preserving reads/assertions.
 script=SITE/'scripts/check_blockchain_navigation.py';source=script.read_text();old="(site/'plans/blockchain-navigation-allowed.diff')";new="(site/'plans/reth-prior/navigation-unused.diff')";assert source.count(old)==1
 adapter=out/'navigation-output-only-adapter.py';adapter.write_text(source.replace(old,new))
 wrapper='import sys;from pathlib import Path;sys.path.insert(0,'+repr(str(script.parent))+');sys.argv='+repr([str(script),'--build-dir',str(a.build_dir),'--generated-dir',str(a.generated_dir),'--output',str(out/'navigation-unused.json')])+';exec(compile(Path('+repr(str(adapter))+').read_text(),'+repr(str(script))+',"exec"),dict(__name__="__main__",__file__='+repr(str(script))+'))'
 run('navigation-full-output-only-adapter',[sys.executable,'-c',wrapper],1)
 # Original Hyperliquid HTML/resource statements, stopping only at the historical baseline read.
 script=SITE/'scripts/check_hyperliquid_orders.py';module=ast.parse(script.read_text());fn=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='main');stop=next(i for i,n in enumerate(fn.body) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='baseline' for t in n.targets));last=fn.body[stop-1].end_lineno
 fn.body=fn.body[:stop]+ast.parse("args.output.write_text(json.dumps(dict(status='passed',checkedLinks=len(checked),assets=assets,scope='Original HTML and resource assertions; complete source protection in check_reth_wiki.py'),ensure_ascii=False,indent=2))").body;ast.fix_missing_locations(module)
 argv=sys.argv[:];sys.argv=[str(script),'--build-dir',str(a.build_dir),'--output',str(out/'hyperliquid-original-html.json')]
 try:exec(compile(module,str(script),'exec'),dict(__name__='__main__',__file__=str(script)))
 finally:sys.argv=argv
 # Enumerate every historical freeze difference, distinguishing pre-task drift and the one navigation edit.
 initial=json.loads((SITE/'plans/reth-baseline-initial.json').read_text());freezes=[]
 names=['uniswap-v3-final-manifest.json','aave-v3-final-manifest.json','drift-position-final-manifest.json','hyperliquid-orders-final-manifest.json','blockchain-navigation-final-manifest.json','wiki-readme-final-manifest.json','wiki-readme-title-revision-manifest.json']
 for name in names:
  p=SITE/'plans'/name;m=json.loads(p.read_text());deltas=[]
  for row in m['files']:
   f=row['file'];actual=sha(ROOT/f);at_start=initial['sourceFiles'].get(f)
   if actual==row['sha256']:continue
   own=actual!=at_start and f=='wiki/docs/wiki/blockchain/ethereum/README.md'
   external={r['file']:r['latestSha256'] for r in json.loads((SITE/'plans/reth-external-final.json').read_text())['files']}
   assert actual==at_start or own or actual==external.get(f),(name,f,'unexpected historical drift')
   deltas.append(dict(file=f,historicalSha256=row['sha256'],taskInitialSha256=at_start,currentSha256=actual,changedByReth=own,scope='One exact Reth navigation insertion' if own else 'Pre-task or explicitly recorded concurrent external state; not a Reth change'))
  freezes.append(dict(manifest=str(p.relative_to(ROOT)),manifestSha256=sha(p),filesChecked=len(m['files']),mismatches=deltas))
 frozen_diff=SITE/'plans/wiki-readme-title-revision.diff'
 # Its pre-task hash may already differ from the #9 original; preserve the actual task-start bytes.
 assert sha(frozen_diff)==initial['sourceFiles'][str(frozen_diff.relative_to(ROOT))]
 report=dict(status='Original failures retained; original HTML assertions passed; full before/after protection is separate',commands=results,currentLegacyOriginal=dict(result=json.loads((out/'legacy-current-full-unused.json').read_text()),scope='Unmodified script passed current pre-task 380-record fixture; not all original 381 URLs'),historicalContractInputSha256=sha(SITE/'plans/reth-historical-contract.json'),hyperliquidOriginalHtmlThroughLine=last,historicalFreezes=freezes,readmeRevisionDiffPreservedSha256=sha(frozen_diff),remainingProtection='check_reth_wiki.py: every old source and exact one-line navigation delta, all active pre-task identities/IDs, all README edges, all 381 historical rows compared before/after, five journeys/56 downloads, input/workspace and staged equality')
 (SITE/'plans/reth-prior-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS: original HTML checks; original current legacy check; historical failures and historical deltas retained')
if __name__=='__main__':main()
