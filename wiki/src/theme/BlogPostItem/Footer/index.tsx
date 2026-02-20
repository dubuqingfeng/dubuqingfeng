import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { ThemeClassNames } from "@docusaurus/theme-common";
import EditMetaRow from "@theme/EditMetaRow";
import TagsListInline from "@theme/TagsListInline";
import ReadMoreLink from "@theme/BlogPostItem/Footer/ReadMoreLink";

export default function BlogPostItemFooter(): JSX.Element | null {
  const { metadata, isBlogPostPage } = useBlogPost();
  const {
    tags,
    title,
    editUrl,
    lastUpdatedBy,
    lastUpdatedAt,
    permalink,
  } = metadata;

  const tagsExists = tags.length > 0;

  // Details view: keep classic behavior (tags + edit meta).
  if (isBlogPostPage) {
    const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);
    if (!tagsExists && !canDisplayEditMetaRow) {
      return null;
    }
    return (
      <footer className="docusaurus-mt-lg">
        {tagsExists && (
          <div
            className={clsx(
              "row",
              "margin-top--sm",
              ThemeClassNames.blog.blogFooterEditMetaRow
            )}
          >
            <div className="col">
              <TagsListInline tags={tags} />
            </div>
          </div>
        )}
        {canDisplayEditMetaRow && (
          <EditMetaRow
            className={clsx(
              "margin-top--sm",
              ThemeClassNames.blog.blogFooterEditMetaRow
            )}
            editUrl={editUrl}
            lastUpdatedAt={lastUpdatedAt}
            lastUpdatedBy={lastUpdatedBy}
          />
        )}
      </footer>
    );
  }

  // List view: always show "Read more" (we render excerpts only).
  return (
    <footer className="row docusaurus-mt-lg">
      {tagsExists && (
        <div className="col col--9">
          <TagsListInline tags={tags} />
        </div>
      )}
      <div
        className={clsx("col text--right", {
          "col--3": tagsExists,
          "col--12": !tagsExists,
        })}
      >
        <ReadMoreLink blogPostTitle={title} to={permalink} />
      </div>
    </footer>
  );
}

