#!/usr/bin/env python3
"""Verify the exact three authorized title exceptions without rewriting frozen checks."""
import argparse
import base64
import hashlib
import json
import re
import subprocess
import sys
from html import unescape
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'wiki'
PLAN=SITE/'plans'
TITLE_ROWS={
 'wiki/docs/wiki/blockchain/README.md':('区块链：从状态变化读源码','Blockchain','区块链从状态变化读源码'),
 'wiki/docs/wiki/blockchain/defi/README.md':('DeFi：结算、借款与永续仓位','DeFi','defi结算借款与永续仓位'),
 'wiki/docs/wiki/blockchain/solana/README.md':('Solana：账户、程序与数据路径','Solana','solana账户程序与数据路径'),
}
ROOT_README='wiki/docs/wiki/README.md'
SELF='wiki/scripts/check_wiki_readme_title_revision.py'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--build-dir',required=True,type=Path);ap.add_argument('--generated-dir',required=True,type=Path);a=ap.parse_args()
 baseline=json.loads((PLAN/'wiki-readme-title-revision-baseline.json').read_text())
 assert sha(PLAN/'wiki-readme-final-manifest.json')==baseline['previousManifestSha256']=='4d9d525dd7ee3d201354a5e621330d67c8f81ca7669f0b47f60e0a911df2c9a1'
 assert set(baseline['changes'])==set(TITLE_ROWS)|{ROOT_README}
 for name,row in baseline['changes'].items():
  old=base64.b64decode(row['beforeBase64']).decode()
  if name in TITLE_ROWS:
   prev,title,anchor=TITLE_ROWS[name]
   replacements=[('title: '+prev,'title: '+title),('# '+prev+'\n','# '+title+'\n\n<span id="'+anchor+'"></span>\n')]
  else:replacements=[('- [区块链](./blockchain/README.md)','- [Blockchain](./blockchain/README.md)')]
  assert row['replacements']==[list(r) for r in replacements]
  new=old
  for before,after in replacements:assert new.count(before)==1;new=new.replace(before,after)
  assert (ROOT/name).read_bytes()==new.encode(),name
  assert hashlib.sha256(old.encode()).hexdigest()==row['beforeSha256']
  assert sha(ROOT/name)==row['afterSha256']
 for name,row in baseline['previousFiles'].items():
  assert sha(ROOT/name)==baseline['changes'].get(name,{}).get('afterSha256',row['sha256']),name
 # Compare every frozen build input after compilation, including its read-only copy.
 inputs=json.loads((PLAN/'wiki-readme-title-revision-build-inputs.json').read_text())
 assert inputs['build']==str(a.build_dir)
 copy=Path(inputs['copy']).parent
 for name,h in inputs['sourceFiles'].items():
  assert sha(ROOT/name)==sha(copy/name)==h,name
  assert not (copy/name).stat().st_mode&0o222,name
 from datetime import datetime,timezone
 (PLAN/'wiki-readme-title-revision-input-check.json').write_text(json.dumps(dict(status='passed',checkedAt=datetime.now(timezone.utc).isoformat(),sourceFilesChecked=len(inputs['sourceFiles']),workspaceAndIsolatedCopyHashes='identical',isolatedInputFiles='read-only',persistentCacheDisabled=True),ensure_ascii=False,indent=2)+'\n')
 # Keep the original full failure as evidence, separate from the exact adapter.
 cmd=[sys.executable,str(SITE/'scripts/check_wiki_readmes.py'),'--build-dir',str(a.build_dir),'--generated-dir',str(a.generated_dir),'--output',str(PLAN/'wiki-readme-title-revision-original-unused.json')]
 r=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
 (PLAN/'wiki-readme-title-revision-original.log').write_text(r.stdout+r.stderr)
 assert r.returncode==1,(r.returncode,r.stderr)
 script=SITE/'scripts/check_wiki_readmes.py';source=script.read_text()
 assert sha(script)==baseline['previousFiles']['wiki/scripts/check_wiki_readmes.py']['sha256']
 # Normalize only exact prevalidated revision bytes for the old source-preservation assertions.
 # Every route, anchor, link, tree, resource and other source assertion executes unchanged.
 old="new=file.read_bytes().decode()";new="new=normalize_revision(file,file.read_bytes().decode())"
 assert source.count(old)==1;source=source.replace(old,new)
 old="'wiki/scripts/check_wiki_readme_prior.py'}";new="'wiki/scripts/check_wiki_readme_prior.py', '"+SELF+"'}"
 assert source.count(old)==1;source=source.replace(old,new)
 (PLAN/'wiki-readme-title-revision-adapter.py').write_text(source)
 ns={'__name__':'revision_original','__file__':str(script)};exec(compile(source,str(script),'exec'),ns)
 real_digest=ns['digest'];real_metadata=ns['metadata']
 def normalize(file,text):
  rel=str(file.relative_to(ROOT))
  return base64.b64decode(baseline['changes'][rel]['beforeBase64']).decode() if rel in baseline['changes'] else text
 def digest(file):
  rel=str(file.relative_to(ROOT)) if file.is_relative_to(ROOT) else ''
  return baseline['changes'][rel]['beforeSha256'] if rel in baseline['changes'] else real_digest(file)
 verified=[]
 def metadata(directory):
  result=real_metadata(directory)
  for name,(prev,title,anchor) in TITLE_ROWS.items():
   m=result[name];assert m['title']==title,(name,m['title'])
   file=ns['locate'](a.build_dir,m['permalink']);page=ns['Page'](file);html=file.read_text()
   headings=[unescape(re.sub('<[^>]+>','',h)) for h in re.findall(r'<h1\b[^>]*>(.*?)</h1>',html)]
   assert headings==[title],(name,headings)
   assert anchor in page.ids,(name,anchor)
   # SSR sidebar link label must match exactly on its active page.
   links=re.findall(r'<a\b([^>]*\bhref="'+re.escape(m['permalink'].rstrip('/'))+r'/?"[^>]*)>(.*?)</a>',html)
   labels=[unescape(re.sub('<[^>]+>','',t)) for attrs,t in links if 'menu__link' in attrs]
   assert title in labels,(name,labels)
   verified.append(dict(file=name,title=title,h1=headings[0],oldTitle=prev,explicitTitleAnchor=anchor,sidebarLabels=labels,id=m['id'],slug=m['slug'],permalink=m['permalink']))
   m['title']=prev
  root_page=ns['locate'](a.build_dir,result[ROOT_README]['permalink']).read_text()
  assert re.search(r'<a\b[^>]*href="/docs/wiki/blockchain/?"[^>]*>Blockchain</a>',root_page),'Root directory Blockchain label'
  return result
 ns.update(normalize_revision=normalize,digest=digest,metadata=metadata)
 output=PLAN/'wiki-readme-title-revision-checks.json';argv=sys.argv[:]
 sys.argv=[str(script),'--build-dir',str(a.build_dir),'--generated-dir',str(a.generated_dir),'--output',str(output)]
 try:ns['main']()
 finally:sys.argv=argv
 report=json.loads(output.read_text());report.update(titleExceptions=verified,originalFullCheckExitCode=r.returncode,sourceChanges=list(baseline['changes']),previousDeliveryFilesChecked=len(baseline['previousFiles']),adapterScope='Only exact prevalidated source bytes/digests and three metadata titles normalized for frozen protection; actual new titles/H1/anchors/sidebar verified separately; original checker unchanged')
 output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('PASS: exact title exceptions, H1, sidebar, old anchors; previous delivery unchanged except four exact files')

if __name__=='__main__':main()
