import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import type { Props } from "@theme/BlogPostItem/Container";
import styles from "./styles.module.css";

export default function BlogPostItemContainer({
  children,
  className,
}: Props): JSX.Element {
  const { isBlogPostPage } = useBlogPost();

  return (
    <article
      className={clsx(
        className,
        styles.post,
        !isBlogPostPage && styles.postCard
      )}
    >
      {children}
    </article>
  );
}

