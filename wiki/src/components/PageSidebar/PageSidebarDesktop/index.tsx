import React from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import Logo from '@theme/Logo';
import CollapseButton from '@theme/DocSidebar/Desktop/CollapseButton';
import Content from '@theme/DocSidebar/Desktop/Content';
import type {Props} from '@theme/DocSidebar/Desktop';
import { ThemeClassNames } from '@docusaurus/theme-common';

import SidebarStyles from '@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Sidebar/styles.module.css';
import styles from './styles.module.css';

function PageSidebarDesktop({path, sidebar, onCollapse, isHidden}: Props) {
  const {
    navbar: {hideOnScroll},
    docs: {
      sidebar: {},
    },
  } = useThemeConfig();

  return (
    <div
      className={clsx(
        SidebarStyles.docSidebarContainer,
        ThemeClassNames.docs.docSidebarContainer,
        styles.sidebar,
        hideOnScroll && styles.sidebarWithHideableNavbar,
        isHidden && styles.sidebarHidden,
      )}>
      {hideOnScroll && <Logo tabIndex={-1} className={styles.sidebarLogo} />}
      <Content path={path} sidebar={sidebar} />
      {false && <CollapseButton onClick={onCollapse} />}
    </div>
  );
}

export default React.memo(PageSidebarDesktop);