import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function HtmlIndexPage() {
  const src = useBaseUrl('/html-pages/index.html');

  return (
    <Layout
      title="HTML"
      description="独立 HTML 页面索引"
      noFooter
    >
      <main
        style={{
          height: 'calc(100vh - var(--ifm-navbar-height))',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <iframe
          src={src}
          title="HTML 索引"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </main>
    </Layout>
  );
}
