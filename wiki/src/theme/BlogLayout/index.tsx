import React, {type ReactNode, useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import {useWindowSize} from '@docusaurus/theme-common';

import type {Props} from '@theme/BlogLayout';

import styles from './styles.module.css';

const STORAGE_KEY = 'docusaurus.blog.sidebarCollapsed';

export default function BlogLayout(props: Props): ReactNode {
  const {sidebar, toc, children, ...layoutProps} = props;
  const windowSize = useWindowSize();

  const hasSidebar = !!(sidebar && sidebar.items.length > 0);

  // Avoid hydration mismatch: read persisted state only after mount.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      // Ignore (private mode / blocked storage).
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // Ignore.
    }
  }, [sidebarCollapsed]);

  const canCollapse = useMemo(() => {
    // Mobile already uses the built-in mobile sidebar; keep this toggle for desktop only.
    return hasSidebar && windowSize !== 'mobile';
  }, [hasSidebar, windowSize]);

  const showSidebar = canCollapse ? !sidebarCollapsed : hasSidebar;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          {showSidebar && <BlogSidebar sidebar={sidebar} />}
          <main
            className={clsx('col', {
              'col--7': showSidebar,
              'col--9 col--offset-1': !showSidebar,
            })}>
            {canCollapse && (
              <div className={styles.sidebarToggleRow}>
                <button
                  type="button"
                  className={clsx(
                    'button button--sm button--secondary',
                    styles.sidebarToggleButton,
                  )}
                  onClick={() => setSidebarCollapsed((v) => !v)}>
                  {sidebarCollapsed ? '显示近期文章' : '收起近期文章'}
                </button>
              </div>
            )}
            {children}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}

