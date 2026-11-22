#!/usr/bin/env python3
"""Check the generated Uniswap article, guide, fragments and raw experiment assets."""
import argparse
import base64
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.ids, self.links, self.images = set(), [], []
        self.in_article = False
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'article':
            self.in_article = True
        if 'id' in a:
            self.ids.add(a['id'])
        if self.in_article and tag == 'a' and 'href' in a:
            self.links.append(a['href'])
        if self.in_article and tag == 'img' and 'src' in a:
            assert a.get('alt'), 'Missing image alt'
            self.images.append(a['src'])

    def handle_endtag(self, tag):
        if tag == 'article':
            self.in_article = False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build-dir', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    root = args.build_dir
    site = Path(__file__).resolve().parents[1]
    new = '/docs/wiki/blockchain/defi/uniswap/v3-swap'
    old = '/docs/Wiki/blockchain/ethereum/contract/uniswap'

    def locate(url):
        p = root / unquote(url).lstrip('/')
        for f in (p, p.with_name(p.name + '.html'), p / 'index.html'):
            if f.is_file():
                return f
        raise AssertionError(f'Missing target {url}')

    pages = {u: Page(locate(u)) for u in (new, old)}
    assert new in pages[old].links, 'Guide does not link to article'
    assert old in pages[new].links, 'Article does not link to old guide'
    assert {'uniswap', '参考链接'} <= pages[old].ids
    assert {'question','model','math','path','source','boundaries','experiment','tradeoffs'} <= pages[new].ids
    svg = (site / 'static/img/blockchain/uniswap-v3-swap.svg').read_bytes()
    def image_bytes(url):
        if url.startswith('data:image/svg+xml;base64,'):
            return base64.b64decode(url.split(',', 1)[1])
        return locate(urlsplit(url).path).read_bytes()
    assert any(image_bytes(u) == svg for u in pages[new].images)
    checked = []
    external = set()
    for base, page in pages.items():
        for link in page.links + page.images:
            if link.startswith('data:'):
                assert image_bytes(link) == svg
                checked.append('inline SVG matches source')
                continue
            u = urlsplit(urljoin(base, link))
            if u.scheme or u.netloc:
                external.add(link)
                continue
            f = locate(u.path)
            if u.fragment:
                assert unquote(u.fragment) in Page(f).ids, f'Missing fragment {link}'
            checked.append(u.path + ('#' + u.fragment if u.fragment else ''))
    assets = []
    source = site / 'static/examples/uniswap-v3-swap'
    for f in sorted(source.iterdir()):
        if not f.is_file():
            continue
        dst = root / 'examples/uniswap-v3-swap' / f.name
        assert f.read_bytes() == dst.read_bytes(), f'Asset differs: {f.name}'
        assets.append({'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
    ET.parse(root / 'img/blockchain/uniswap-v3-swap.svg')
    result = {'status':'passed','localArticleLinksAndImagesChecked':len(checked),
              'newRoute':new,'retainedGuideRoute':old,'originalGuideAnchors':'passed',
              'eightExplicitSectionAnchors':'passed','assets':assets,
              'externalLinksCollectedNotLiveChecked':sorted(external),
              'scope':'static HTML and assets; no deployed HTTP or browser execution'}
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in ('assets','externalLinksCollectedNotLiveChecked')},ensure_ascii=False))


if __name__ == '__main__':
    main()
