#!/usr/bin/env python3
"""Check the public Wiki URL contract against a Docusaurus build."""

import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.headings = set()
        self.ids = set()
        self.canonical = None
        self.navbar_links = set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        # Match browser HTML tokenization for legacy generated null characters.
        if "id" in attrs:
            self.ids.add(attrs["id"].replace("\x00", "\ufffd"))
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"} and "id" in attrs:
            self.headings.add(attrs["id"].replace("\x00", "\ufffd"))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = urlsplit(attrs.get("href", "")).path.rstrip("/")
        if tag == "a" and "navbar__link" in attrs.get("class", "").split():
            self.navbar_links.add(attrs.get("href"))


def exact_file(root, relative):
    current = root
    for part in Path(relative).parts:
        if part not in {child.name for child in current.iterdir()}:
            raise ValueError(f"Source path case mismatch: {relative}")
        current /= part
    if not current.is_file():
        raise ValueError(f"Missing source file: {relative}")


def page_file(build_dir, url):
    path = build_dir / unquote(url).lstrip("/")
    for candidate in (path, Path(str(path) + ".html"), path / "index.html"):
        if candidate.is_file():
            return candidate
    raise ValueError(f"Missing HTML for URL: {url}")


def check(build_dir, site_dir):
    fixture = json.loads((site_dir / "plans/wiki-legacy-routes.json").read_text())
    names = {child.name for child in (site_dir / "docs").iterdir()}
    if "wiki" not in names or "Wiki" in names:
        raise ValueError("Source directory must be docs/wiki, with no docs/Wiki")
    sitemap = {
        urlsplit(node.text).path.rstrip("/")
        for node in ET.parse(build_dir / "sitemap.xml").findall(".//{*}loc")
    }
    records = fixture["legacy_routes"] + fixture["existing_lowercase_routes"]
    seen = set()
    pages = {}
    anchors = 0
    for record in records:
        url = record["url"]
        if url in seen:
            raise ValueError(f"Duplicate fixture URL: {url}")
        seen.add(url)
        exact_file(site_dir, record["source"])
        if url not in sitemap:
            raise ValueError(f"URL missing from sitemap: {url}")
        page = Page(page_file(build_dir, url).read_text())
        pages[url] = page
        if page.canonical != url:
            raise ValueError(f"Wrong canonical URL: {url}: {page.canonical}")
        # A former heading target can also be retained by an explicit alias.
        missing = set(record["heading_ids"]) - page.ids
        if missing:
            raise ValueError(f"Missing original heading anchors: {url}: {sorted(missing)}")
        if fixture["navbar_url"] not in page.navbar_links:
            raise ValueError(f"Wiki navbar target missing: {url}")
        anchors += len(record["heading_ids"])
    for alias in fixture.get("anchor_aliases", []):
        page = pages[alias["url"]]
        if alias["browser_id"] not in page.ids or alias["heading_id"] not in page.headings:
            raise ValueError(f"Missing stable heading or legacy alias: {alias['url']}")
    return {
        "legacy_urls": len(fixture["legacy_routes"]),
        "existing_lowercase_urls": len(fixture["existing_lowercase_routes"]),
        "original_heading_anchors": anchors,
        "explicit_legacy_aliases": len(fixture.get("anchor_aliases", [])),
        "canonical_urls_and_navbar": "passed",
        "source_directory": fixture["source_directory"],
        "scope": "local static build, not a deployed HTTP check",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build-dir", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        result = check(args.build_dir.resolve(), Path(__file__).resolve().parents[1])
    except (OSError, ValueError, ET.ParseError) as error:
        parser.exit(1, f"Wiki URL compatibility check failed: {error}\n")
    output = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(output)
    print(output, end="")


if __name__ == "__main__":
    main()
