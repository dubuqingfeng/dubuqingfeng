import React, { useEffect, useMemo, useState } from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import styles from "./sitenav.module.css";

// We fetch from /static at runtime so updating the link file doesn't require a rebuild.
// `static/json/*` is served as `{baseUrl}/json/*` in Docusaurus.

type LinkItem = {
  link: string;
  name: string;
  description?: string;
};

type RightClassify = {
  id?: string;
  name: string;
  description?: string;
  links: LinkItem[];
};

type RightSection = {
  name: string;
  description?: string;
  special?: LinkItem[];
  classify?: RightClassify[];
};

function safeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeUrl(url: string): string {
  // Some items might be missing a protocol; keep rendering clickable URLs.
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function SiteNavPage() {
  const rightUrl = useBaseUrl("/json/right_links.yaml");

  const [sections, setSections] = useState<RightSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setError(null);

        const rightRes = await fetch(rightUrl);
        if (!rightRes.ok) {
          throw new Error(`Failed to fetch right_links.yaml: ${rightRes.status}`);
        }

        const rightText = await rightRes.text();

        // js-yaml is already present in this repo (transitive dependency).
        // Keep it dynamic to avoid any bundler edge cases with CJS interop.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const yaml = require("js-yaml") as { load: (s: string) => unknown };
        const rightYaml = yaml.load(rightText) as RightSection[];

        if (cancelled) return;
        setSections(Array.isArray(rightYaml) ? rightYaml : []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? String(e));
        setSections([]);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [rightUrl]);

  const stats = useMemo(() => {
    const total =
      sections?.reduce((acc, s) => {
        const special = s.special?.length ?? 0;
        const classify =
          s.classify?.reduce((a, c) => a + (c.links?.length ?? 0), 0) ?? 0;
        return acc + special + classify;
      }, 0) ?? 0;
    return { total };
  }, [sections]);

  const columns = useMemo(() => {
    const left: RightSection[] = [];
    const right: RightSection[] = [];
    for (const [i, s] of (sections ?? []).entries()) {
      (i % 2 === 0 ? left : right).push(s);
    }
    return { left, right };
  }, [sections]);

  const renderSection = (sec: RightSection, idx: number) => {
    const secId = safeSlug(sec.name) || `sec-${idx}`;
    return (
      <div key={`${sec.name}-${idx}`} className={styles.section}>
        <h3 className={styles.sectionTitle} id={secId}>
          {sec.name}
        </h3>
        {sec.description ? (
          <div className={styles.sectionDesc}>{sec.description}</div>
        ) : null}

        {(sec.special?.length ?? 0) > 0 ? (
          <div className={styles.subSection}>
            <div className={styles.subTitle}>Special</div>
            <div className={styles.linkGrid}>
              {sec.special!.map((l, i) => (
                <a
                  key={`${l.link}-${i}`}
                  className={clsx(styles.linkCard, styles.specialCard)}
                  href={normalizeUrl(l.link)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className={styles.linkName}>{l.name}</div>
                  {l.description ? (
                    <div className={styles.linkDesc}>{l.description}</div>
                  ) : null}
                  <div className={styles.linkUrl}>{l.link}</div>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {(sec.classify?.length ?? 0) > 0 ? (
          <div className={styles.subSection}>
            {sec.classify!.map((c, i) => {
              const classifyId = c.id || `${secId}-${safeSlug(c.name) || i}`;
              return (
                <div key={`${classifyId}-${i}`} className={styles.classify}>
                  <h4 className={styles.classifyTitle} id={classifyId}>
                    {c.name}
                  </h4>
                  {c.description ? (
                    <div className={styles.classifyDesc}>{c.description}</div>
                  ) : null}
                  <div className={styles.linkGrid}>
                    {(c.links ?? []).map((l, j) => (
                      <a
                        key={`${l.link}-${j}`}
                        className={styles.linkCard}
                        href={normalizeUrl(l.link)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div className={styles.linkName}>{l.name}</div>
                        {l.description ? (
                          <div className={styles.linkDesc}>{l.description}</div>
                        ) : null}
                        <div className={styles.linkUrl}>{l.link}</div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Layout title="Site Nav" description="Website navigation">
      <div className={clsx("container", "padding-vert--lg")}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Site Nav</h1>
          </div>
          <div className={styles.meta}>
            <div>Total: {stats.total}</div>
          </div>
        </div>

        {error ? (
          <div className={styles.errorBox}>
            <div className={styles.errorTitle}>加载失败</div>
            <div className={styles.errorMsg}>{error}</div>
          </div>
        ) : null}

        {!sections ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            <section className={styles.col}>
              {sections.length === 0 ? (
                <div className={styles.muted}>No items</div>
              ) : (
                columns.left.map((sec, idx) => renderSection(sec, idx * 2))
              )}
            </section>
            <section className={styles.col}>
              {sections.length === 0 ? null : columns.right.map((sec, idx) => renderSection(sec, idx * 2 + 1))}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
