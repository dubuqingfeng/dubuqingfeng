#!/usr/bin/env python3
"""Check Hyperliquid old routes/anchors and actual HTML links/resources, plus frozen scope."""
import argparse
import base64
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from check_drift_position import Page


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--build-dir',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();build=args.build_dir.resolve();site=Path(__file__).resolve().parents[1];root=site.parent
    base='/docs/Wiki/blockchain/hyperliquid'
    routes={
      '/docs/wiki/blockchain/hyperliquid':['基础概念','api','操作指南','网络'],
      base+'/concepts/overview':['概览'],base+'/concepts/margins':['保证金与风险'],
      base+'/api/rest':['rest-api'],base+'/api/ws':['websocket-订阅'],
      base+'/guides/orders':['下单与撤单'],base+'/guides/query':['查询账户与持仓'],base+'/network/networks':['网络与链']}
    def locate(path):
        file=build/unquote(path).lstrip('/')
        for x in (file,Path(str(file)+'.html'),file/'index.html'):
            if x.is_file():return x
        raise AssertionError('Missing '+path)
    pages={url:Page(locate(url)) for url in routes}
    for route,ids in routes.items():assert set(ids)<=pages[route].ids,(route,ids)
    main_page=pages[base+'/guides/orders']
    assert {'question','model','state-math','path','source','failures','reproduce','tradeoffs'}<=main_page.ids
    svg=(site/'static/img/blockchain/hyperliquid-orders.svg').read_bytes();ET.fromstring(svg)
    def image_bytes(url):
        if url.startswith('data:image/svg+xml;base64,'):return base64.b64decode(url.split(',',1)[1])
        return locate(urlsplit(url).path).read_bytes()
    assert any(image_bytes(x)==svg for x in main_page.images)
    checked=[];external=set()
    for route,page in pages.items():
        for href in page.links+page.images:
            if href.startswith('data:'):
                assert image_bytes(href)==svg;checked.append('inline SVG matches source');continue
            url=urlsplit(urljoin(route,href))
            if url.scheme or url.netloc:external.add(href);continue
            target=locate(url.path)
            if url.fragment:assert unquote(url.fragment) in Page(target).ids,(route,href)
            checked.append(url.path+('#'+url.fragment if url.fragment else ''))
    assets=[]
    for f in sorted((site/'static/examples/hyperliquid-orders').iterdir()):
        assert f.is_file(),f
        assert f.read_bytes()==(build/'examples/hyperliquid-orders'/f.name).read_bytes(),f
        assets.append(dict(file=f.name,bytes=f.stat().st_size,sha256=hashlib.sha256(f.read_bytes()).hexdigest()))
    baseline=json.loads((site/'plans/hyperliquid-orders-baseline.json').read_text())
    for file,sha in baseline['files'].items():assert hashlib.sha256((root/file).read_bytes()).hexdigest()==sha,file
    staged=hashlib.sha256(subprocess.check_output(['git','diff','--cached','--raw','-z'],cwd=root)).hexdigest()
    assert staged==baseline['stagedRawDiffSha256']
    # The three unrelated Hyperliquid pages remain byte-exact.
    unchanged=[]
    for file,old in baseline['hyperliquidOriginalPages']['files'].items():
        if file.endswith(('concepts/overview.md','concepts/margins.md','network/networks.md')):
            assert hashlib.sha256((root/file).read_bytes()).hexdigest()==old['sha256'];unchanged.append(file)
    result=dict(status='passed',eightOldRoutesAndTitles='passed',eightSectionIds='passed',localLinksAndImagesChecked=len(checked),checked=checked,
                assets=assets,priorFrozenFilesPreserved=len(baseline['files']),unchangedHyperliquidPages=unchanged,stagedRawDiffSha256=staged,
                externalCollectedNotLiveChecked=sorted(external),scope='Static build, file preservation; no deployed HTTP or real trading/WS verification')
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS:',len(checked),'links/images,',len(assets),'downloads, 8 old pages,',len(baseline['files']),'frozen files and shared staging')


if __name__=='__main__':main()
