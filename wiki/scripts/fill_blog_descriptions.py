#!/usr/bin/env python3
"""
Fill Docusaurus blog front matter `description` from the intro/excerpt.

Behavior:
- For each `blog/*.md`:
  - If `description` is missing or empty, extract the first ~2 meaningful
    paragraphs from the content (prefer content before `<!-- truncate -->`).
  - Convert the markdown-ish intro to plain text and write it into front matter.

Notes:
- Keeps existing descriptions by default.
- The goal is to ensure `/blog` list view has a short excerpt even when we don't
  want to render the full post.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"

TRUNCATE_RE = re.compile(r"<!--\s*truncate\s*-->|\{/\*\s*truncate\s*\*/\}")


def split_front_matter(text: str) -> tuple[str | None, str]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return None, text
    for i in range(1, min(len(lines), 400)):
        if lines[i].strip() == "---":
            fm = "".join(lines[: i + 1])
            body = "".join(lines[i + 1 :])
            return fm, body
    return None, text


def front_matter_has_nonempty_description(fm: str) -> bool:
    for line in fm.splitlines():
        if line.startswith("description:"):
            val = line.split("description:", 1)[1].strip()
            return bool(val) and val not in {"''", '""', "null", "~"}
    return False


def front_matter_has_description_key(fm: str) -> bool:
    return any(line.startswith("description:") for line in fm.splitlines())


def clean_markdown_to_text(md: str) -> str:
    s = md
    # Drop fenced code blocks
    s = re.sub(r"```[\s\S]*?```", "", s)
    # Drop HTML tags (keep nothing)
    s = re.sub(r"<[^>]+>", "", s)
    # Drop images ![alt](url)
    s = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", s)
    # Links [text](url) -> text
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    # Inline code
    s = s.replace("`", "")
    # Headings
    s = re.sub(r"^\s{0,3}#{1,6}\s+", "", s, flags=re.M)
    # Blockquotes marker
    s = re.sub(r"^\s{0,3}>\s?", "", s, flags=re.M)
    # List bullets
    s = re.sub(r"^\s*[-*+]\s+", "", s, flags=re.M)
    s = re.sub(r"^\s*\d+\.\s+", "", s, flags=re.M)
    # Collapse whitespace
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def extract_intro_paragraphs(body: str, max_paragraphs: int = 2) -> list[str]:
    # Prefer the content before truncate marker if present.
    pre = TRUNCATE_RE.split(body, 1)[0]
    pre = pre.strip()
    if not pre:
        return []

    # Split paragraphs by blank line
    paras = [p.strip() for p in re.split(r"\n\s*\n", pre) if p.strip()]

    picked: list[str] = []
    for p in paras:
        # Skip pure image paragraphs or short separators
        if re.fullmatch(r"!\[[^\]]*\]\([^)]+\)", p):
            continue
        if p.strip() in {"---", "***"}:
            continue

        txt = clean_markdown_to_text(p)
        if not txt:
            continue

        picked.append(txt)
        if len(picked) >= max_paragraphs:
            break

    return picked


def yaml_double_quote(s: str) -> str:
    # Minimal escaping for YAML double-quoted scalars.
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    # Avoid newlines in description for simplicity.
    s = re.sub(r"\s*\n\s*", " ", s).strip()
    return f'"{s}"'


def upsert_description(front_matter: str, description: str) -> str:
    lines = front_matter.splitlines(keepends=True)
    out: list[str] = []
    inserted = False
    replaced = False

    for line in lines:
        if line.startswith("description:"):
            out.append(f"description: {description}\n")
            replaced = True
            continue
        out.append(line)

    if replaced:
        return "".join(out)

    # Insert after title if possible, otherwise after opening '---'
    for idx, line in enumerate(out):
        if line.startswith("title:"):
            out.insert(idx + 1, f"description: {description}\n")
            inserted = True
            break

    if not inserted:
        # out[0] is '---\n'
        out.insert(1, f"description: {description}\n")

    return "".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--overwrite", action="store_true", help="overwrite existing non-empty description")
    ap.add_argument("--max-chars", type=int, default=220, help="max description length")
    args = ap.parse_args()

    if not BLOG_DIR.exists():
        print(f"blog dir not found: {BLOG_DIR}")
        return 1

    changed = 0
    for path in sorted(BLOG_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        fm, body = split_front_matter(text)
        if fm is None:
            continue

        if front_matter_has_nonempty_description(fm) and not args.overwrite:
            continue

        intro_paras = extract_intro_paragraphs(body, max_paragraphs=2)
        if not intro_paras:
            continue

        desc = " ".join(intro_paras)
        if len(desc) > args.max_chars:
            desc = desc[: args.max_chars].rstrip() + "..."

        new_fm = upsert_description(fm, yaml_double_quote(desc))
        if new_fm != fm:
            path.write_text(new_fm + body, encoding="utf-8")
            changed += 1

    print(f"updated {changed} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

