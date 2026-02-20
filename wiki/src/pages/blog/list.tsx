import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import { PageMetadata } from "@docusaurus/theme-common";
import { useDateTimeFormat } from "@docusaurus/theme-common/internal";
import styles from "./list.module.css";

type BlogArchivePost = {
  metadata: {
    title: string;
    permalink: string;
    date: string;
    unlisted?: boolean;
  };
};

type BlogArchiveData = {
  archive: {
    blogPosts: BlogArchivePost[];
  };
};

function loadBlogArchive(): BlogArchiveData | null {
  // The archive JSON file name is hashed, so we can't import it statically.
  // Webpack can bundle it via require.context.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = (require as any).context(
      "@generated/docusaurus-plugin-content-blog/default/p",
      false,
      /^\.\/blog-archive-.*\.json$/,
    );
    const key = req.keys()?.[0];
    if (!key) return null;
    const mod = req(key);
    return (mod?.default ?? mod) as BlogArchiveData;
  } catch {
    return null;
  }
}

export default function BlogSimpleListPage(): JSX.Element {
  const fmt = useDateTimeFormat({ year: "numeric", month: "2-digit", day: "2-digit" });
  const archive = loadBlogArchive();
  const items = (archive?.archive?.blogPosts ?? [])
    .map((p) => p.metadata)
    .filter((i) => !i.unlisted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout title="Blog List" description="Blog 文章列表（仅标题与时间）">
      <PageMetadata title="Blog List" description="Blog 文章列表（仅标题与时间）" />
      <main className="container margin-vert--lg">
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>文章列表</h1>
            <p className={styles.subtitle}>仅显示时间与标题，共 {items.length} 篇。</p>
          </div>
          <div className={styles.actions}>
            <Link className={clsx("button button--secondary", styles.btn)} to="/blog">
              返回 Blog
            </Link>
            <Link className={clsx("button button--primary", styles.btn)} to="/blog/archive">
              Archive
            </Link>
          </div>
        </header>

        <section className={styles.list}>
          {items.map((item) => {
            const d = new Date(item.date);
            return (
              <div key={item.permalink} className={styles.row}>
                <time className={styles.date} dateTime={item.date}>
                  {Number.isNaN(d.getTime()) ? item.date : fmt.format(d)}
                </time>
                <Link className={styles.link} to={item.permalink}>
                  {item.title}
                </Link>
              </div>
            );
          })}
        </section>
      </main>
    </Layout>
  );
}
