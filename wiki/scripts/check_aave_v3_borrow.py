#!/usr/bin/env python3
"""Verify actual Aave HTML links, fragments, SVG and reproducibility downloads."""
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
        self.article = False
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article':
            self.article = True
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if self.article and tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if self.article and tag == 'img' and 'src' in attrs:
            assert attrs.get('alt')
            self.images.append(attrs['src'])

    def handle_endtag(self, tag):
        if tag == 'article':
            self.article = False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build-dir', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    build = args.build_dir.resolve()
    site = Path(__file__).resolve().parents[1]
    article = '/docs/wiki/blockchain/defi/aave/v3-borrow-health-factor'
    guide = '/docs/wiki/blockchain/defi/aave'

    def locate(url):
        file = build/unquote(url).lstrip('/')
        for candidate in (file, Path(str(file)+'.html'), file/'index.html'):
            if candidate.is_file():
                return candidate
        raise AssertionError('Missing '+url)

    pages = {url:Page(locate(url)) for url in [article, guide]}
    assert article in {urlsplit(url).path.rstrip('/') for url in pages[guide].links}
    assert guide in {urlsplit(url).path.rstrip('/') for url in pages[article].links}
    assert {'question','model','math','path','source','boundaries','experiment','tradeoffs'} <= pages[article].ids
    svg = (site/'static/img/blockchain/aave-v3-borrow.svg').read_bytes()
    ET.fromstring(svg)

    def image_bytes(url):
        return base64.b64decode(url.split(',',1)[1]) if url.startswith('data:image/svg+xml;base64,') else locate(urlsplit(url).path).read_bytes()

    assert any(image_bytes(url) == svg for url in pages[article].images)
    checked, external = [], set()
    for base, page in pages.items():
        for link in page.links+page.images:
            if link.startswith('data:'):
                assert image_bytes(link) == svg
                checked.append('inline SVG matches source')
                continue
            url = urlsplit(urljoin(base,link))
            if url.scheme or url.netloc:
                external.add(link)
                continue
            target = locate(url.path)
            if url.fragment:
                assert unquote(url.fragment) in Page(target).ids, link
            checked.append(url.path+('#'+url.fragment if url.fragment else ''))
    assets = []
    for file in sorted((site/'static/examples/aave-v3-borrow').iterdir()):
        assert file.is_file(), 'Unexpected directory in downloadable experiment'
        target = build/'examples/aave-v3-borrow'/file.name
        assert file.read_bytes() == target.read_bytes(), file.name
        assets.append({'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
    assert len(assets) == 13
    result = {'status':'passed','article':article,'guide':guide,'eightSectionIds':'passed','localLinksAndImagesChecked':len(checked),'checked':checked,'assets':assets,'externalCollectedNotLiveChecked':sorted(external),'scope':'Actual static HTML and resources; no deployed HTTP/browser or external link availability check'}
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS:',len(checked),'local links/images and',len(assets),'byte-exact experiment downloads')


if __name__ == '__main__':
    main()
