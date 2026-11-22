#!/usr/bin/env python3
"""Check #7 navigation in final HTML and every original source protection condition.
No legacy manifest/baseline is rewritten; the five allowed navigation files have reviewable diffs.
"""
import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote,urljoin,urlsplit
from check_drift_position import Page


def sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()


class Sidebar(HTMLParser):
    def __init__(self,file):
        super().__init__();self.active=False;self.links=set();self.feed(file.read_text())
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='nav' and attrs.get('aria-label')=='文档侧边栏':self.active=True
        if self.active and tag=='a' and 'href' in attrs:self.links.add(urlsplit(attrs['href']).path.rstrip('/'))
    def handle_endtag(self,tag):
        if tag=='nav':self.active=False


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--build-dir',required=True,type=Path)
    parser.add_argument('--generated-dir',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    args=parser.parse_args();site=Path(__file__).resolve().parents[1];root=site.parent;build=args.build_dir.resolve()
    baseline=json.loads((site/'plans/blockchain-navigation-baseline.json').read_text());allowed=set(baseline['allowedNavigationChanges'])
    changed=[];preserved=0
    for name,old in baseline['sourceFiles'].items():
        f=root/name;assert f.is_file(),name
        if sha(f)!=old:
            assert name in allowed,('Unapproved source change',name)
            before=baseline['beforeText'][name];after=f.read_bytes().decode()
            if name.endswith('.md') and not name.endswith('blockchain-depth-plan.md'):
                assert after.startswith(before),('Existing guide content not preserved',name)
            changed.append(dict(file=name,beforeSha256=old,afterSha256=sha(f),
                                diff=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=name+' (before #7)',tofile=name+' (after #7)'))))
        else:preserved+=1
    assert {x['file'] for x in changed}==allowed
    allowed_new=set(baseline['newPages'])|{'wiki/scripts/check_blockchain_navigation.py','wiki/scripts/check_prior_navigation_links.py'}
    unexpected=[]
    for base,dirs,names in os.walk(site):
        dirs[:]=[x for x in dirs if x not in ['node_modules','.docusaurus','build','.git','__pycache__']]
        for name in names:
            f=Path(base)/name
            if f.is_symlink() or name=='.DS_Store':continue
            rel=str(f.relative_to(root))
            if rel not in baseline['sourceFiles'] and rel not in allowed_new and not rel.startswith('wiki/plans/blockchain-navigation-'):unexpected.append(rel)
    assert not unexpected,unexpected
    for f in baseline['newPages']:assert (root/f).is_file(),f
    historical=[]
    for name in baseline['historicalManifests']:
        m=json.loads((root/name).read_text());mismatches=[]
        for row in m['files']:
            if sha(root/row['file'])!=row['sha256']:mismatches.append(row['file'])
        assert set(mismatches)<=allowed,(name,mismatches)
        historical.append(dict(manifest=name,manifestSha256=sha(root/name),filesChecked=len(m['files']),allowedNavigationMismatches=mismatches))
    # Re-run every protection that the original Hyperliquid checker did not reach.
    old=json.loads((site/'plans/hyperliquid-orders-baseline.json').read_text())
    mismatches=[]
    for f,h in old['files'].items():
        if sha(root/f)!=h:mismatches.append(f)
    assert set(mismatches)<=allowed,mismatches
    unchanged=[]
    for f,oldpage in old['hyperliquidOriginalPages']['files'].items():
        if f.endswith(('concepts/overview.md','concepts/margins.md','network/networks.md')):
            assert sha(root/f)==oldpage['sha256'],f;unchanged.append(f)
    staged=hashlib.sha256(subprocess.check_output(['git','diff','--cached','--raw','-z'],cwd=root)).hexdigest()
    assert staged==old['stagedRawDiffSha256']==baseline['stagedRawDiffSha256']
    assert sha(site/'plans/wiki-legacy-routes.json')=='31487d9d0cc7d094f93821ccc613816d015db4a89dcec273e65706372fbe7113'
    def locate(path):
        f=build/unquote(path).lstrip('/')
        for x in (f,Path(str(f)+'.html'),f/'index.html'):
            if x.is_file():return x
        raise AssertionError('Missing '+path)
    # Use Docusaurus' actual resolved source/permalink/auto-sidebar metadata.
    meta={}
    for file in args.generated_dir.glob('*.json'):
        obj=json.loads(file.read_text())
        if isinstance(obj,dict) and obj.get('source','').startswith('@site/docs/'):
            meta['wiki/'+obj['source'][6:]]=obj
    docs=[name for name in baseline['newPages']+baseline['allowedNavigationChanges'] if name.startswith('wiki/docs/')]
    metadata=[];routes={}
    for name in docs:
        obj=meta[name];assert obj['sidebar']=='tutorialSidebar' and not obj['draft'] and not obj['unlisted'],name
        url=obj['permalink'].rstrip('/');routes[name]=url
        assert url in Sidebar(locate(url)).links,('Missing rendered sidebar link',name,url)
        metadata.append(dict(source=name,docId=obj['id'],permalink=obj['permalink'],sidebar=obj['sidebar'],renderedSidebarLink='passed'))
    hub=routes['wiki/docs/wiki/blockchain/README.md'];hubpage=Page(locate(hub));checked=[];external=set();downloads={}
    def links_for(route,page):
        for href in page.links+page.images:
            if href.startswith('data:'):continue
            url=urlsplit(urljoin(route,href))
            if url.scheme or url.netloc:external.add(href);continue
            f=locate(url.path)
            if url.fragment:assert unquote(url.fragment) in Page(f).ids,(route,href)
            checked.append(dict(from_=route,to=url.path,fragment=url.fragment))
            if url.path.startswith('/examples/') or url.path.startswith('/img/'):
                src=site/'static'/unquote(url.path).lstrip('/');assert src.is_file() and src.read_bytes()==f.read_bytes(),href
                downloads[url.path]=sha(src)
    for name,route in routes.items():links_for(route,Page(locate(route)))
    # Five direct choices, valid experiment fragments, live downloads, and topic-home return links.
    experiments={
      'wiki/docs/wiki/blockchain/solana/data-path.md':'experiment',
      'wiki/docs/wiki/blockchain/defi/uniswap/v3-swap.md':'experiment',
      'wiki/docs/wiki/blockchain/defi/aave/v3-borrow-health-factor.md':'experiment',
      'wiki/docs/wiki/blockchain/defi/perps/drift-position-lifecycle.md':'reproduce',
      'wiki/docs/wiki/blockchain/hyperliquid/guides/orders.md':'reproduce'}
    journeys=[]
    for name,fragment in experiments.items():
        obj=meta[name];route=obj['permalink'].rstrip('/');page=Page(locate(route))
        assert any(urlsplit(h).path.rstrip('/')==route and urlsplit(h).fragment==fragment for h in hubpage.links),(name,fragment)
        assert fragment in page.ids
        # Docusaurus rewrites some Markdown downloads to /assets/files/<name>-<hash>.
        assets=[h for h in page.links if urlsplit(h).path.startswith(('/examples/','/assets/files/'))];assert assets,name
        text=(root/name).read_text()
        references=re.findall(r'\]\((/examples/[^)\s]+)\)',text)+re.findall(r'href="(/examples/[^"\s]+)"',text)
        expected={site/'static'/p.lstrip('/') for p in references}
        assert expected,name
        matched=set()
        for href in assets:
            url=urlsplit(href);target=locate(url.path)
            sources=[s for s in expected if s.read_bytes()==target.read_bytes()]
            assert sources,('Unexpected or changed download',name,href)
            matched.update(sources);downloads[url.path]=sha(target)
        assert matched==expected,('Unlinked original experiment resources',name,sorted(map(str,expected-matched)))
        journeys.append(dict(main=name,route=route,experimentFragment=fragment,downloadsChecked=len(assets)))
    for name,route in routes.items():
        if route==hub:continue
        assert any(urlsplit(h).path.rstrip('/')==hub for h in Page(locate(route)).links),('Missing return to hub',name)
    assert {'choose','read','evidence','topics'}<=hubpage.ids
    report=dict(status='passed',sourceFilesAtBaseline=len(baseline['sourceFiles']),unchangedSourceFiles=preserved,allowedNavigationChanges=changed,newPages=baseline['newPages'],
                historicalManifests=historical,hyperliquidLegacyBaseline=dict(filesChecked=len(old['files']),allMismatches=mismatches,unchangedHyperliquidPages=unchanged,staging='passed'),
                stagedRawDiffSha256=staged,autoSidebarMetadata=metadata,localLinksChecked=len(checked),checked=checked,journeys=journeys,downloads=downloads,
                externalCollectedNotLiveChecked=sorted(external),unexpectedNewFiles=unexpected,scope='Actual final HTML/resources and source preservation; no deployed HTTP/browser or unchanged protocol experiment reruns')
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (site/'plans/blockchain-navigation-allowed.diff').write_text(''.join(x['diff'] for x in changed))
    print('PASS:',len(checked),'navigation links,',len(downloads),'download resources, 5 reading journeys,',preserved,'unchanged files, 5 explicit navigation diffs')


if __name__=='__main__':main()
