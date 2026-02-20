import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import {
  HtmlClassNameProvider,
  PageMetadata,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import BlogListPaginator from "@theme/BlogListPaginator";
import BlogPostItems from "@theme/BlogPostItems";
import SearchMetadata from "@theme/SearchMetadata";
import BlogListPageStructuredData from "@theme/BlogListPage/StructuredData";
import type { Props } from "@theme/BlogListPage";
import styles from "./styles.module.css";

function BlogListPageMetadata(props: Props): JSX.Element {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const isBlogOnlyMode = permalink === "/";
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogHero({
  title,
  description,
}: {
  title: string;
  description?: string;
}): JSX.Element {
  const stats = usePluginData("blog-stats") as { total?: number } | undefined;
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroKicker}>Dubuqingfeng</div>
        <h1 className={styles.heroTitle}>{title}</h1>
        {description ? <p className={styles.heroSubtitle}>{description}</p> : null}
        {stats?.total ? (
          <p className={styles.heroMeta}>共 {stats.total} 篇</p>
        ) : null}
        <div className={styles.heroActions}>
          <Link
            className={clsx("button button--secondary", styles.heroButton)}
            to="/blog/tags"
          >
            Tags
          </Link>
          <Link
            className={clsx("button button--secondary", styles.heroButton)}
            to="/blog/list"
          >
            List
          </Link>
          <Link
            className={clsx("button button--secondary", styles.heroButton)}
            to="/blog/archive"
          >
            Archive
          </Link>
          <Link
            className={clsx("button button--secondary", styles.heroButton)}
            to="/blog/stats"
          >
            Stats
          </Link>
        </div>
      </div>
    </header>
  );
}

function BlogListPageContent(props: Props): JSX.Element {
  const { metadata, items, sidebar } = props;
  return (
    <BlogLayout sidebar={sidebar}>
      <BlogHero
        title={metadata.blogTitle ?? "Blog"}
        description={metadata.blogDescription}
      />
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function BlogListPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
