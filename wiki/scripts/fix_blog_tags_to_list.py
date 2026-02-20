#!/usr/bin/env python3
"""
Normalize Docusaurus blog front matter `tags` to a YAML list style:

  tags:
    - TagA
    - TagB

Why:
- Docusaurus validates `tags` as a YAML array; `tags: some-string` or `tags:`
  (null) can throw a ValidationError.
"""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"


def split_tags(raw: str) -> list[str]:
    s = raw.strip()
    if not s:
        return []
    # Normalize common separators.
    s = s.replace("，", ",")
    parts = [p.strip() for p in s.split(",") if p.strip()]
    return parts if parts else [s]


def is_front_matter_boundary(line: str) -> bool:
    return line.strip() == "---"


def normalize_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    if not lines or not is_front_matter_boundary(lines[0]):
        return False

    end = None
    for i in range(1, min(len(lines), 300)):
        if is_front_matter_boundary(lines[i]):
            end = i
            break
    if end is None:
        return False

    # Find a `tags:` key inside front matter.
    tags_idx = None
    for i in range(1, end):
        if lines[i].lstrip().startswith("tags:"):
            tags_idx = i
            break
    if tags_idx is None:
        return False

    line = lines[tags_idx]
    # Keep newline style.
    nl = "\n" if line.endswith("\n") else ""
    after = line.split("tags:", 1)[1].strip()

    # Case 1: already YAML list style: `tags:` followed by `- ...` lines.
    if after == "":
        j = tags_idx + 1
        while j < end and lines[j].strip() == "":
            j += 1
        if j < end and lines[j].lstrip().startswith("-"):
            return False
        # `tags:` with null value -> invalid for Docusaurus; set to empty array.
        lines[tags_idx] = f"tags: []{nl}"
        path.write_text("".join(lines), encoding="utf-8")
        return True

    # Case 2: already inline array/object.
    if after.startswith("[") or after.startswith("{"):
        return False

    # Case 3: `tags: some-string` -> convert to list style.
    tags = split_tags(after)
    if not tags:
        lines[tags_idx] = f"tags: []{nl}"
        path.write_text("".join(lines), encoding="utf-8")
        return True

    indent = "  "
    new_block = [f"tags:{nl}"] + [f"{indent}- {t}{nl}" for t in tags]
    lines[tags_idx : tags_idx + 1] = new_block
    path.write_text("".join(lines), encoding="utf-8")
    return True


def main() -> int:
    if not BLOG_DIR.exists():
        print(f"blog dir not found: {BLOG_DIR}")
        return 1

    changed = []
    # Blog posts may be nested, and can be .md or .mdx.
    candidates = [
        p
        for p in BLOG_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in {".md", ".mdx"}
    ]
    for path in sorted(candidates):
        if normalize_file(path):
            changed.append(path)

    print(f"updated {len(changed)} file(s)")
    for p in changed:
        print(f"- {p.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
