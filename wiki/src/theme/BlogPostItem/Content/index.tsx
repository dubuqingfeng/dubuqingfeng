import React from "react";
import clsx from "clsx";
import { blogPostContainerID } from "@docusaurus/utils-common";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import MDXContent from "@theme/MDXContent";
import styles from "./styles.module.css";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function BlogPostItemContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  const { isBlogPostPage, metadata } = useBlogPost();

  // Details view: render full MDX content.
  if (isBlogPostPage) {
    return (
      <div id={blogPostContainerID} className={clsx("markdown", className)}>
        <MDXContent>{children}</MDXContent>
      </div>
    );
  }

  // List view:
  // - If author used a truncate marker, Docusaurus already provides truncated MDX content
  //   (via `?truncated=true`). Render that.
  // - Otherwise, never render full content: use the generated description/excerpt only.
  if (metadata?.hasTruncateMarker) {
    return (
      <div className={clsx("markdown", className)}>
        <div className={styles.excerpt}>
          <MDXContent>{children}</MDXContent>
        </div>
      </div>
    );
  }

  const desc = (metadata?.description ?? "").trim();
  const paragraphs = desc ? splitParagraphs(desc).slice(0, 2) : [];

  return (
    <div className={clsx("markdown", className)}>
      {paragraphs.length > 0 ? (
        <div className={styles.excerpt}>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={styles.excerptParagraph}>
              {p}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
