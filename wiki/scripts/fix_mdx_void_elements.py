#!/usr/bin/env python3
"""
Fix common MDX compilation errors by self-closing void HTML tags in Markdown/MDX.

In MDX, raw HTML like `<img ...>` must be `<img ... />` (or have an explicit
closing tag, which void elements don't).
"""

from __future__ import annotations

import re
import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

# Common HTML void elements that should be self-closed in MDX.
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}


TAG_RE = re.compile(r"<(?P<tag>[a-zA-Z][\w:-]*)\b(?P<attrs>[^>]*)>")


def fix_text(text: str) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal count
        tag = m.group("tag")
        attrs = m.group("attrs")

        low = tag.lower()
        # Skip non-void tags.
        if low not in VOID_TAGS:
            return m.group(0)

        # Already self-closed: <img .../> or <img ... />
        if attrs.rstrip().endswith("/"):
            return m.group(0)

        count += 1
        # Preserve original spacing in attrs, but ensure ` />` at the end.
        if attrs.endswith(" "):
            return f"<{tag}{attrs}/>"
        return f"<{tag}{attrs} />"

    new_text = TAG_RE.sub(repl, text)
    return new_text, count


def should_process(path: Path) -> bool:
    return path.suffix.lower() in {".md", ".mdx"}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Self-close HTML void tags (e.g. <img>) for MDX compatibility."
    )
    parser.add_argument(
        "--paths",
        nargs="*",
        default=["blog", "docs", "src"],
        help="Root-relative folders to scan (default: blog docs src).",
    )
    args = parser.parse_args()

    targets = [ROOT / p for p in args.paths]

    changed_files: list[Path] = []
    total_fixes = 0

    for base in targets:
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file() or not should_process(path):
                continue
            text = path.read_text(encoding="utf-8")
            new_text, fixes = fix_text(text)
            if fixes:
                path.write_text(new_text, encoding="utf-8")
                changed_files.append(path)
                total_fixes += fixes

    print(f"fixed {total_fixes} tag(s) in {len(changed_files)} file(s)")
    for p in changed_files[:80]:
        print("-", p.relative_to(ROOT))
    if len(changed_files) > 80:
        print(f"... and {len(changed_files) - 80} more")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
