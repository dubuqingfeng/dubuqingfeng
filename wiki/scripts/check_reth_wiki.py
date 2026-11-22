#!/usr/bin/env python3
"""Verify new Reth pages and preserve the actual pre-task site without rewriting historical checks."""
import argparse
import base64
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tarfile
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import unquote,urljoin,urlsplit
from check_wiki_readmes import Page,locate,metadata
from check_wiki_legacy_routes import Page as LegacyPage
ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'wiki'
DOCS=SITE/'docs/wiki'
NEW={'wiki/docs/wiki/blockchain/ethereum/reth/'+name for name in ('README.md','node-architecture.md','transaction-pool-payload.md','execution-state.md')}
NAV='wiki/docs/wiki/blockchain/ethereum/README.md'
EXTERNAL_STATIC_DRIFT={'wiki/static/html-pages/index.html','wiki/static/html-pages/solana/accountsdb/index.html','wiki/static/html-pages/solana/accountsdb/style.css','wiki/static/html-pages/blockchain/parallel-execution/index.html','wiki/static/html-pages/blockchain/parallel-execution/style.css'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def enumerate_sources():
 out={}
 for base,dirs,names in os.walk(SITE):
  dirs[:]=[d for d in dirs if d not in ('node_modules','.docusaurus','build','.git','__pycache__')]
  for n in names:
   p=Path(base)/n
   if n=='.DS_Store' or p.is_symlink():continue
   out[str(p.relative_to(ROOT))]=sha(p)
 return out

def contract(build,fixture):
 sitemap={urlsplit(n.text).path.rstrip('/') for n in ET.parse(build/'sitemap.xml').findall('.//{*}loc')};out=[]
 for row in fixture['legacy_routes']+fixture['existing_lowercase_routes']:
  url=row['url'];record=dict(source=row['source'],url=url,sourceExists=(SITE/row['source']).is_file(),sitemap=url in sitemap)
  try:page=LegacyPage(locate(build,url).read_text())
  except AssertionError:record.update(html=False,missingHeadingIds=row['heading_ids'],canonical=None,navbarTargetPresent=False)
  else:record.update(html=True,missingHeadingIds=sorted(set(row['heading_ids'])-page.ids),canonical=page.canonical,navbarTargetPresent=fixture['navbar_url'] in page.navbar_links)
  out.append(record)
 return out

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--build-dir',required=True,type=Path);ap.add_argument('--generated-dir',required=True,type=Path);a=ap.parse_args();build=a.build_dir
 baseline=json.loads((SITE/'plans/reth-baseline.json').read_text());routes=json.loads((SITE/'plans/reth-routes-before.json').read_text())
 initial=json.loads((SITE/'plans/reth-baseline-initial.json').read_text());external=json.loads((SITE/'plans/reth-external-final.json').read_text())['files'];external_map={r['file']:r for r in external}
 assert set(initial['sourceFiles'])==set(baseline['sourceFiles'])
 for name,h in initial['sourceFiles'].items():
  if baseline['sourceFiles'][name]!=h:
   assert name in external_map and external_map[name]['taskInitialSha256']==h and baseline['sourceFiles'][name]==external_map[name]['latestSha256'],name
 external_current=[]
 for row in external:
  actual=sha(ROOT/row['file'])
  if actual!=row['latestSha256']:assert row['file'] in EXTERNAL_STATIC_DRIFT,row['file']
  external_current.append(dict(file=row['file'],buildSnapshotSha256=row['latestSha256'],observedWorkspaceSha256=actual,observedAt=datetime.now(timezone.utc).isoformat(),matchesSnapshot=actual==row['latestSha256'],scope='External static page; fixed snapshot copied directly to build; not a Reth deliverable'))
 old=base64.b64decode(baseline['ethereumReadmeBeforeBase64']).decode();marker='### 子目录 {#directory-children}\n\n';assert old.count(marker)==1
 expected=old.replace(marker,marker+'- [Reth](./reth/README.md)\n');assert (ROOT/NAV).read_text()==expected
 current=enumerate_sources();preserved=[]
 for name,h in baseline['sourceFiles'].items():
  assert name in current,('Deleted old source',name)
  if name==NAV:continue
  if current[name]!=h:
   assert name in EXTERNAL_STATIC_DRIFT and h==external_map[name]['latestSha256'],('Unexpected old source drift',name)
  else:preserved.append(name)
 diff=''.join(difflib.unified_diff(old.splitlines(True),expected.splitlines(True),fromfile='before/'+NAV,tofile='after/'+NAV));(SITE/'plans/reth-navigation-allowed.diff').write_text(diff)
 staged=hashlib.sha256(subprocess.check_output(['git','diff','--cached','--raw','-z'],cwd=ROOT)).hexdigest();assert staged==baseline['stagedRawDiffSha256']
 inputs=json.loads((SITE/'plans/reth-build-inputs.json').read_text());copy=Path(inputs['copy']).parent
 for name,h in inputs['sourceFiles'].items():
  assert sha(copy/name)==h,name
  if name not in EXTERNAL_STATIC_DRIFT:assert sha(ROOT/name)==h,name
  else:assert sha(build/Path(name).relative_to('wiki/static'))==h,name
  assert not (copy/name).stat().st_mode&0o222,name
 # Derive the actual docs and content directories without a generated plan or manifest.
 docs=sorted(p for p in DOCS.rglob('*') if p.is_file() and p.suffix in ('.md','.mdx'))
 assert {str(p.relative_to(ROOT)) for p in docs}==set(baseline['wikiDocuments'])|NEW
 directories={DOCS}
 for p in docs:directories.update(d for d in [p.parent,*p.parent.parents] if d==DOCS or DOCS in d.parents)
 assert all((d/'README.md').is_file() for d in directories)
 meta=metadata(a.generated_dir);prior=routes['pages'];assert set(meta)==set(prior)|NEW
 collisions={r:n for r,n in Counter(m['permalink'].rstrip('/').casefold() for m in meta.values()).items() if n>1};assert not collisions,collisions
 old_pages=[]
 for name,row in prior.items():
  m=meta[name]
  for k in ('id','slug','permalink','title'):assert m[k]==row[k],(name,k)
  page=Page(locate(build,m['permalink']));assert page.canonical==row['canonical'],name
  assert set(row['articleIds'])<=page.ids,(name,'old article IDs');assert set(row['headingIds'])<=page.headingIds,(name,'old headings')
  old_pages.append(name)
 internal=[];external=set();resources={};index_rows=[];emitted_resources=[]
 check_sources={str((d/'README.md').relative_to(ROOT)) for d in directories}|NEW
 for name in sorted(check_sources):
  m=meta[name];page=Page(locate(build,m['permalink']));assert m['permalink'].rstrip('/') in page.sidebarLinks,(name,'sidebar entry')
  if name in NEW:
   expected_resources=re.findall(r'\]\((/(?:examples/reth-v2\.11\.0/|img/reth/)[^ )]+)\)',(ROOT/name).read_text())
   emitted={}
   for href in page.links+page.images:
    if href.startswith('data:image/svg+xml;base64,'):data=base64.b64decode(href.split(',',1)[1])
    elif href.startswith(('/assets/files/','/examples/reth-v2.11.0/','/img/reth/')):data=locate(build,href).read_bytes()
    else:continue
    emitted[href]=hashlib.sha256(data).hexdigest()
   for href in expected_resources:
    source=SITE/'static'/href.lstrip('/');h=sha(source);assert h in emitted.values(),(name,href,'missing or changed emitted resource')
    resources[href]=h;emitted_resources.append(dict(page=name,source=href,sha256=h,emitted=[u if not u.startswith('data:') else 'inline SVG data URI' for u,v in emitted.items() if v==h]))
  for href in page.links+page.images:
   if href.startswith('data:'):continue
   u=urlsplit(urljoin(m['permalink'],href))
   if u.scheme or u.netloc:external.add(href);continue
   target=locate(build,u.path)
   if u.fragment:assert unquote(u.fragment) in Page(target).ids,(name,href)
   internal.append(dict(source=name,target=u.path,fragment=u.fragment))
   if u.path.startswith(('/examples/reth-v2.11.0/','/img/reth/')):
    source=SITE/'static'/unquote(u.path).lstrip('/');assert source.read_bytes()==target.read_bytes(),u.path;resources[u.path]=sha(source)
 for d in sorted(directories):
  name=str((d/'README.md').relative_to(ROOT));m=meta[name];page=Page(locate(build,m['permalink']));targets={urlsplit(urljoin(m['permalink'],href)).path.rstrip('/') for href in page.links}
  assert 'directory-index' in page.ids,name
  articles=[p for p in docs if p.parent==d and p.name!='README.md'];children=sorted(c for c in directories if c.parent==d)
  required=articles+[c/'README.md' for c in children]
  if d!=DOCS:required.append(d.parent/'README.md')
  for p in required:assert meta[str(p.relative_to(ROOT))]['permalink'].rstrip('/') in targets,(name,str(p))
  index_rows.append(dict(directory=str(d.relative_to(ROOT)),directArticles=len(articles),directDirectories=len(children),parentRequired=d!=DOCS))
 # Every downloadable source file is copied byte-for-byte, including unlinked reproduction inputs.
 package=SITE/'static/examples/reth-v2.11.0';package_rows={}
 for p in package.rglob('*'):
  if p.is_file():
   url='/examples/reth-v2.11.0/'+str(p.relative_to(package));assert sha(locate(build,url))==sha(p),url;package_rows[url]=sha(p)
 for f,h in json.loads((package/'files.sha256.json').read_text()).items():assert sha(package/f)==h,f
 archive_members=[]
 with tarfile.open(package/'reth-v2.11.0-lab.tar.gz') as archive:
  for member in archive.getmembers():
   if member.isfile():
    rel=Path(member.name).relative_to('reth-v2.11.0-lab');assert archive.extractfile(member).read()==(package/rel).read_bytes(),str(rel);archive_members.append(str(rel))
 # Check all eight-section source articles, headings, local diagrams, README labels.
 for name in NEW:
  page=Page(locate(build,meta[name]['permalink']))
  if not name.endswith('/README.md'):
   assert {'question','version','components','source','state','experiment','tradeoffs','limits'}<=page.ids,name
 for rel,title in [('blockchain','Blockchain'),('blockchain/defi','DeFi'),('blockchain/solana','Solana'),('blockchain/ethereum/reth','Reth')]:assert meta['wiki/docs/wiki/'+rel+'/README.md']['title']==title
 journeys=json.loads((SITE/'plans/blockchain-navigation-final-links.json').read_text());hub=Page(locate(build,'/docs/wiki/blockchain/'))
 for journey in journeys['journeys']:
  assert journey['experimentFragment'] in Page(locate(build,journey['route'])).ids
  assert any(urlsplit(h).path.rstrip('/')==journey['route'] and urlsplit(h).fragment==journey['experimentFragment'] for h in hub.links)
 for route,h in journeys['downloads'].items():assert sha(locate(build,route))==h,route
 # Compare every field of each original 381-route contract row, including pre-existing failures.
 fixture=SITE/'plans/reth-historical-contract.json';assert sha(fixture)=='acfb9f39f55e457a98882adf6f84777086ce3e9d4a9aa47a93aecf7808b34ad5'
 historical=json.loads(fixture.read_text());before=contract(Path('/Volumes/SolanaCaseCheck/reth-author-before-build'),historical);after=contract(build,historical);assert before==after,'Historical contract changed after Reth edits'
 mismatches=[r for r in after if not r['html'] or not r['sitemap'] or not r['sourceExists'] or r['canonical']!=r['url'] or r['missingHeadingIds'] or not r['navbarTargetPresent']]
 report=dict(status='passed: no Reth regression; pre-existing historical contract failures explicit',externalStaticObservations=external_current,sourceFilesAtStart=len(baseline['sourceFiles']),unchangedOldSourceFiles=len(preserved),authorizedNavigation=dict(file=NAV,beforeSha256=baseline['sourceFiles'][NAV],afterSha256=sha(ROOT/NAV),diff='wiki/plans/reth-navigation-allowed.diff'),stagedRawDiffSha256=staged,currentLegacyFixtureSha256=sha(SITE/'plans/wiki-legacy-routes.json'),buildInputsChecked=len(inputs['sourceFiles']),isolatedInputsReadOnly=True,oldDocsPreserved=len(old_pages),oldWikiDocumentsPreserved=len(baseline['wikiDocuments']),oldHeadingTargetsPreserved=sum(len(r['headingIds']) for r in prior.values()),newWikiDocuments=sorted(NEW),wikiDocuments=len(docs),contentDirectories=len(directories),directories=index_rows,duplicateRoutes=collisions,checkedInternalLinks=len(internal),internalLinks=internal,newResources=resources,emittedResources=emitted_resources,completePackage=package_rows,archiveMembers=archive_members,externalLinks=sorted(external),priorJourneys=len(journeys['journeys']),priorDownloads=len(journeys['downloads']),historicalContract=dict(routes=len(after),before=before,after=after,preExistingMismatches=mismatches,newRegressions=[],oldMissingHtml=[r['url'] for r in after if not r['html']],scope='Actual before/after comparison; neither /docs/Wiki nor navbar silently mapped to contents'),scope='Local static HTML/metadata and source/resources; no browser, deployed HTTP or protocol experiment reruns')
 (SITE/'plans/reth-final-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('PASS',len(directories),'README directories;',len(internal),'internal links;',len(old_pages),'old docs;',len(resources),'new referenced resources; historical HTML missing before and after:',report['historicalContract']['oldMissingHtml'])
if __name__=='__main__':main()
