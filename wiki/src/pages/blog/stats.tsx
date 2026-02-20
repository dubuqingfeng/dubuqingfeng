import React from "react";
import Layout from "@theme/Layout";
import { usePluginData } from "@docusaurus/useGlobalData";
import styles from "./stats.module.css";

type BlogStatsData = {
  total: number;
  byYear: Array<{ year: number; count: number }>;
};

export default function BlogStatsPage(): JSX.Element {
  const data = usePluginData("blog-stats") as BlogStatsData;
  const total = data?.total ?? 0;
  const byYear = data?.byYear ?? [];

  return (
    <Layout title="Blog 统计" description="Blog 文章数量统计">
      <main className={styles.main}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <h1 className={styles.title}>Blog 统计</h1>
            <p className={styles.subtitle}>历史博文总数与年份分布</p>
          </header>

          <section className={styles.card}>
            <div className={styles.totalRow}>
              <div className={styles.totalLabel}>总文章数</div>
              <div className={styles.totalValue}>{total}</div>
            </div>

            {byYear.length ? (
              <ul className={styles.yearList}>
                {byYear.map((x) => (
                  <li key={x.year} className={styles.yearItem}>
                    <span className={styles.year}>{x.year}</span>
                    <span className={styles.count}>{x.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>暂无数据</div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
