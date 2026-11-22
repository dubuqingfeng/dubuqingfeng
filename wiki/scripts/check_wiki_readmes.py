#!/usr/bin/env python3
"""Independently enumerate the current Wiki tree and verify README coverage, routes and preservation."""
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote,urljoin,urlsplit

SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent
DOCS=SITE/'docs/wiki'


def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()


class Page(HTMLParser):
    def __init__(self,path):
        super().__init__();self.article=False;self.sidebar=False;self.links=[];self.images=[];self.ids=set();self.headingIds=set();self.sidebarLinks=set();self.canonical=None
        self.feed(path.read_text())
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='article':self.article=True
        if tag=='nav' and a.get('aria-label')=='文档侧边栏':self.sidebar=True
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
        if self.sidebar and tag=='a' and 'href' in a:self.sidebarLinks.add(urlsplit(a['href']).path.rstrip('/'))
        if self.article:
            if 'id' in a:
                self.ids.add(a['id'])
                if re.fullmatch('h[1-6]',tag):self.headingIds.add(a['id'])
            if tag=='a' and 'href' in a:self.links.append(a['href'])
            if tag=='img' and 'src' in a:self.images.append(a['src'])
    def handle_endtag(self,tag):
        if tag=='article':self.article=False
        if tag=='nav':self.sidebar=False


def locate(build,url):
    file=build/unquote(urlsplit(url).path).lstrip('/')
    for p in (file,Path(str(file)+'.html'),file/'index.html'):
        if p.is_file():return p
    raise AssertionError('Missing built URL: '+url)


def metadata(directory):
    out={}
    for p in directory.glob('*.json'):
        m=json.loads(p.read_text())
        if isinstance(m,dict) and m.get('source','').startswith('@site/docs/'):
            name='wiki/'+m['source'][6:]
            # Docusaurus may retain JSON for deleted source paths in a reused cache.
            if (ROOT/name).is_file():out[name]=m
    return out


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--build-dir',required=True,type=Path);ap.add_argument('--generated-dir',required=True,type=Path);ap.add_argument('--output',required=True,type=Path);ap.add_argument('--capture-before',action='store_true')
    args=ap.parse_args();meta=metadata(args.generated_dir);build=args.build_dir
    baseline=json.loads((SITE/'plans/wiki-readme-baseline.json').read_text())
    if args.capture_before:
        pages={}
        for name,content in baseline['originalDocuments'].items():
            assert (ROOT/name).read_bytes()==base64.b64decode(content),name
            m=meta[name];p=Page(locate(build,m['permalink']))
            pages[name]={k:m[k] for k in ('id','slug','permalink','title')}
            pages[name].update(headingIds=sorted(p.headingIds),articleIds=sorted(p.ids),canonical=p.canonical)
        args.output.write_text(json.dumps(dict(pages=pages,scope='Before-edit metadata and actual article IDs from own case-sensitive build'),ensure_ascii=False,indent=2)+'\n')
        print('CAPTURED',len(pages),'original routes and heading/article IDs');return
    changes=json.loads((SITE/'plans/wiki-readme-changes.json').read_text())
    external=json.loads((SITE/'plans/wiki-readme-external-during.json').read_text())['files']
    for name,row in external.items():
        assert name=='wiki/plans/solana-svm-validation.md' and digest(ROOT/name)==row['sha256'],name
    before_routes=json.loads((SITE/'plans/wiki-readme-routes-before.json').read_text())['pages']
    moves={m['before']:m['after'] for m in changes['migrations']}
    assert set(moves)==set(baseline['indexFiles']) and len(moves)==5
    for a,b in moves.items():assert b==str(Path(a).with_name('README.md'))
    # Independently derive every content directory from the actual Markdown/MDX tree.
    docs=sorted(p for p in DOCS.rglob('*') if p.is_file() and p.suffix.lower() in ('.md','.mdx'))
    directories={DOCS}
    for p in docs:directories.update(d for d in [p.parent,*p.parent.parents] if d==DOCS or DOCS in d.parents)
    assert {str(d.relative_to(ROOT)) for d in directories}==set(baseline['directories'])
    missing=[str(d) for d in directories if not (d/'README.md').is_file()];assert not missing,missing
    assert not list(DOCS.rglob('index.md'))
    # Check changes independently by reversing only exact, validated source-link targets.
    replacement_rows={r['file']:r['links'] for r in changes['sourceLinkReplacements']}
    preserved=0;modified=[]
    for name,oldhash in baseline['sourceFiles'].items():
        target=moves.get(name,name);file=ROOT/target;assert file.is_file(),name
        if digest(file)==oldhash:preserved+=1;continue
        assert name in changes['modifiedOrMoved'],('Unapproved source change',name)
        old=base64.b64decode(baseline['originalDocuments'][name]).decode();new=file.read_bytes().decode()
        if file.name=='README.md':
            marker='\n\n## 本级目录 {#directory-index}\n'
            assert new.count(marker)==1,target
            new=new.split(marker)[0]
        # The only allowed frontmatter changes are absent id/slug/title on five migrated indexes.
        if name in moves:
            original_front=old.split('---',2)[1] if old.startswith('---\n') else ''
            for key in ('id','slug','title'):
                if not re.search(r'^'+key+r':',original_front,re.M):
                    new,count=re.subn(r'^'+key+r':[^\n]*\n','',new,count=1,flags=re.M);assert count==1,(name,key)
        for row in {tuple(sorted(r.items())) for r in replacement_rows.get(target,[])}:
            row=dict(row);old_dest=(ROOT/name).parent/unquote(urlsplit(row['before']).path);new_dest=file.parent/unquote(urlsplit(row['after']).path)
            assert str(old_dest.resolve().relative_to(ROOT)) in moves,row
            assert moves[str(old_dest.resolve().relative_to(ROOT))]==str(new_dest.resolve().relative_to(ROOT)),row
            assert urlsplit(row['before']).fragment==urlsplit(row['after']).fragment,row
            new=new.replace(']('+row['after']+')',']('+row['before']+')').replace('href="'+row['after']+'"','href="'+row['before']+'"')
        assert new==old,('Non-navigation content changed',name)
        assert digest(file)==changes['modifiedOrMoved'][name]['afterSha256'],target
        modified.append(name)
    assert set(modified)==set(changes['modifiedOrMoved'])
    staged=hashlib.sha256(subprocess.check_output(['git','diff','--cached','--raw','-z'],cwd=ROOT)).hexdigest()
    assert staged==baseline['stagedRawDiffSha256']=='3c9da753d1eb14e80c16d1f68c6878867a1cbd00fe01cf069abe3aac3702f1fe'
    assert digest(SITE/'plans/wiki-legacy-routes.json')=='31487d9d0cc7d094f93821ccc613816d015db4a89dcec273e65706372fbe7113'
    allowed_new=set(changes['addedReadmes'])|set(moves.values())|{'wiki/scripts/generate_wiki_readmes.py','wiki/scripts/check_wiki_readmes.py','wiki/scripts/check_wiki_readme_prior.py'}
    unexpected=[]
    for base,dirs,names in os.walk(SITE):
        dirs[:]=[d for d in dirs if d not in ('node_modules','.docusaurus','build','.git','__pycache__')]
        for n in names:
            p=Path(base)/n;rel=str(p.relative_to(ROOT))
            if n=='.DS_Store' or p.is_symlink():continue
            if rel not in baseline['sourceFiles'] and rel not in allowed_new and rel not in external and not rel.startswith('wiki/plans/wiki-readme-'):unexpected.append(rel)
    assert not unexpected,unexpected
    # Preserve all current-before Wiki identities and every existing article/heading anchor.
    original_pages=[]
    for old,prior in before_routes.items():
        name=moves.get(old,old);m=meta[name]
        for key in ('id','slug','permalink','title'):assert m[key]==prior[key],(old,key,prior[key],m[key])
        p=Page(locate(build,m['permalink']))
        assert set(prior['headingIds'])<=p.headingIds,(old,'heading IDs')
        assert set(prior['articleIds'])<=p.ids,(old,'article IDs')
        assert p.canonical==prior['canonical'],(old,'canonical')
        original_pages.append(dict(before=old,after=name,route=m['permalink'],oldHeadingCount=len(prior['headingIds'])))
    collisions={url:[name for name,m in meta.items() if m['permalink'].rstrip('/').casefold()==url] for url,n in Counter(m['permalink'].rstrip('/').casefold() for m in meta.values()).items() if n>1}
    assert not collisions,collisions
    index_rows=[];checked=[];external=set();asset_links=[]
    link_check_sources={str((d/'README.md').relative_to(ROOT)) for d in directories}|{moves.get(p,p) for p in modified}
    for name in sorted(link_check_sources):
        m=meta[name];p=Page(locate(build,m['permalink']))
        for href in p.links+p.images:
            if href.startswith('data:'):continue
            url=urlsplit(urljoin(m['permalink'],href))
            if url.scheme or url.netloc:external.add(href);continue
            try:dest=locate(build,url.path)
            except AssertionError as error:raise AssertionError((name,href,str(error))) from error
            if url.fragment:assert unquote(url.fragment) in Page(dest).ids,(name,href)
            checked.append(dict(source=name,target=url.path,fragment=url.fragment))
            if url.path.startswith(('/examples/','/assets/files/')):asset_links.append(url.path)
    for d in sorted(directories):
        name=str((d/'README.md').relative_to(ROOT));m=meta[name];p=Page(locate(build,m['permalink']))
        assert m.get('sidebar')=='tutorialSidebar' and not m['draft'] and not m['unlisted'],name
        assert m['permalink'].rstrip('/') in p.sidebarLinks,('Missing sidebar entry',name)
        assert 'directory-index' in p.ids,name
        targets={urlsplit(urljoin(m['permalink'],h)).path.rstrip('/') for h in p.links}
        articles=[f for f in docs if f.parent==d and f.name!='README.md']
        children=sorted(c for c in directories if c.parent==d)
        required=articles+[c/'README.md' for c in children]
        if d!=DOCS:required.append(d.parent/'README.md')
        for f in required:assert meta[str(f.relative_to(ROOT))]['permalink'].rstrip('/') in targets,(name,str(f))
        index_rows.append(dict(directory=str(d.relative_to(ROOT)),readme=name,route=m['permalink'],directArticles=len(articles),directDirectories=len(children),parentReadme=None if d==DOCS else str((d.parent/'README.md').relative_to(ROOT)),sidebar='passed'))
    prior=json.loads((SITE/'plans/blockchain-navigation-final-links.json').read_text());download_checks=[]
    for route,sha in prior['downloads'].items():
        assert digest(locate(build,route))==sha,route;download_checks.append(route)
    hub=Page(locate(build,'/docs/wiki/blockchain/'))
    for journey in prior['journeys']:
        route=journey['route'];frag=journey['experimentFragment']
        assert frag in Page(locate(build,route)).ids
        assert any(urlsplit(h).path.rstrip('/')==route and urlsplit(h).fragment==frag for h in hub.links),journey
    report=dict(status='passed',contentDirectories=len(directories),readmes=len(index_rows),missingReadmes=missing,originalDocumentsPreserved=len(original_pages),oldHeadingTargets=sum(x['oldHeadingCount'] for x in original_pages),duplicateRoutes=collisions,sourceFilesAtBaseline=len(baseline['sourceFiles']),unchangedSourceFiles=preserved,modifiedOrMovedOriginalFiles=modified,stagedRawDiffSha256=staged,checkedInternalLinks=len(checked),checks=checked,directories=index_rows,originalPages=original_pages,fivePriorJourneys='passed',prior56DownloadsChecked=download_checks,externalCollectedNotLiveChecked=sorted(external),unexpectedNewFiles=unexpected,scope='Local metadata/HTML/resources and exact source preservation; no deployed HTTP/browser or protocol experiment reruns')
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS',len(directories),'README directories;',len(checked),'internal links;',len(original_pages),'old pages;',len(download_checks),'prior downloads;',preserved,'unchanged source files')


if __name__=='__main__':main()
