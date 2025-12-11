import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "./clover.module.css";

interface QuadrantData {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  description: string;
  items: string[];
  bgColor: string;
}

const quadrantData: QuadrantData[] = [
  {
    id: "health",
    title: "Health",
    icon: "💪",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgColor: "rgba(102, 126, 234, 0.1)",
    description: "身体健康与运动",
    items: [
      "定期锻炼",
      "健康饮食",
      "充足睡眠",
      "定期体检",
    ],
  },
  {
    id: "family",
    title: "Family",
    icon: "❤️",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgColor: "rgba(240, 147, 251, 0.1)",
    description: "家庭与亲情",
    items: [
      "陪伴家人",
      "节日团聚",
      "关心长辈",
      "教育子女",
    ],
  },
  {
    id: "english",
    title: "English",
    icon: "📚",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgColor: "rgba(79, 172, 254, 0.1)",
    description: "英语学习与提升",
    items: [
      "每日阅读",
      "听力练习",
      "口语对话",
      "词汇积累",
    ],
  },
  {
    id: "driving",
    title: "Driving",
    icon: "🚗",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    bgColor: "rgba(254, 225, 64, 0.1)",
    description: "驾驶与出行",
    items: [
      "安全驾驶",
      "定期保养",
      "遵守规则",
      "文明出行",
    ],
  },
];

export default function Clover() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  return (
    <Layout
      title="Four Quadrants"
      description="Life's four important aspects: Health, Family, English, Driving"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>✨ Four Important Aspects</h1>
          <p className={styles.subtitle}>
            生活的四个重要方面
          </p>
        </div>

        <div className={styles.quadrantContainer}>
          <div className={styles.quadrantGrid}>
            {quadrantData.map((quadrant, index) => (
              <div
                key={quadrant.id}
                className={`${styles.quadrant} ${
                  selectedQuadrant === quadrant.id ? styles.quadrantActive : ""
                }`}
                style={{ background: quadrant.gradient }}
                onClick={() =>
                  setSelectedQuadrant(
                    selectedQuadrant === quadrant.id ? null : quadrant.id
                  )
                }
              >
                <div className={styles.quadrantContent}>
                  <div className={styles.quadrantIcon}>{quadrant.icon}</div>
                  <h2 className={styles.quadrantTitle}>{quadrant.title}</h2>
                  <p className={styles.quadrantDesc}>{quadrant.description}</p>
                </div>

                {selectedQuadrant !== quadrant.id && (
                  <div className={styles.clickHint}>点击查看详情</div>
                )}
              </div>
            ))}
          </div>

          {/* 中心装饰 */}
          <div className={styles.centerDecoration}>
            <div className={styles.centerCircle}>
              <span className={styles.centerIcon}>🎯</span>
            </div>
          </div>
        </div>

        {/* 详情卡片 - 显示在四象限下方 */}
        {selectedQuadrant && (
          <div className={styles.detailCard}>
            {quadrantData.map(
              (quadrant) =>
                quadrant.id === selectedQuadrant && (
                  <div key={quadrant.id} className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardIcon}>{quadrant.icon}</span>
                      <div>
                        <h2 className={styles.cardTitle}>{quadrant.title}</h2>
                        <p className={styles.cardSubtitle}>{quadrant.description}</p>
                      </div>
                    </div>
                    <ul className={styles.cardList}>
                      {quadrant.items.map((item, idx) => (
                        <li key={idx} className={styles.cardListItem}>
                          <span className={styles.checkmark}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
