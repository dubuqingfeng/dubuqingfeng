const fs = require("fs/promises");
const path = require("path");
const matter = require("gray-matter");

/**
 * A tiny local plugin that counts blog posts and exposes stats via global data.
 * This avoids importing hashed @generated JSON files from `.docusaurus/`.
 */
module.exports = async function blogStatsPlugin(context, options) {
  const blogPath = options?.blogPath ?? "blog";
  const contentPath = path.resolve(context.siteDir, blogPath);

  async function walk(dir) {
    const out = [];
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const ent of entries) {
      if (ent.name.startsWith(".")) continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        out.push(...(await walk(abs)));
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (ext === ".md" || ext === ".mdx") out.push(abs);
      }
    }
    return out;
  }

  function yearFromFilename(filePath) {
    const stem = path.basename(filePath, path.extname(filePath));
    const m = stem.match(/^(\d{4})/);
    return m ? Number(m[1]) : null;
  }

  function yearFromDateValue(dateValue) {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    // Invalid date -> NaN
    if (Number.isNaN(d.getTime())) return null;
    return d.getUTCFullYear();
  }

  return {
    name: "blog-stats",

    async loadContent() {
      const files = await walk(contentPath);
      const byYear = new Map();

      for (const file of files) {
        let year = null;
        try {
          const raw = await fs.readFile(file, "utf8");
          const fm = matter(raw).data || {};
          year = yearFromDateValue(fm.date) ?? yearFromFilename(file);
        } catch {
          year = yearFromFilename(file);
        }
        if (!year) continue;
        byYear.set(year, (byYear.get(year) ?? 0) + 1);
      }

      const byYearList = Array.from(byYear.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([year, count]) => ({ year, count }));

      const total = byYearList.reduce((sum, x) => sum + x.count, 0);

      return {
        total,
        byYear: byYearList,
      };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};

