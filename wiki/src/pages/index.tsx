import React, { useState } from "react";
import clsx from "clsx";
import Layout from "@site/theme/Layout";
import Link from "@docusaurus/Link";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { isMobile, setClipBoardText } from "@site/src/utils";
import {
  contactMeData,
  languagesMenuData,
  blockchainMenuData,
  databaseMenuData,
  frameworkMenuData,
  devopsMenuData,
  securityMenuData,
  othersMenuData,
  languagesGridList,
  blockchainGridList,
  databaseGridList,
  frameworkGridList,
  devOpsGridList,
  securityGridList,
  othersGridList,
} from "@site/src/data";
import GridList from "@site/src/components/GridList";
import styles from "./styles.module.css";

import favicon from "@site/static/img/favicon/favicon.jpeg";
import github from "@site/static/img/icon/github.png";
import gmail from "@site/static/img/icon/gmail.png";
import twitter from "@site/static/img/icon/twitter.png";
import telegram from "@site/static/img/icon/telegram.png";
import wechat from "@site/static/img/icon/wexin_mini_program.png";
import zhihu from "@site/static/img/icon/zhihu.png";
import sitenav from "@site/static/img/icon/sitenav.png";
import techblog from "@site/static/img/icon/blog.png";
import lifeblog from "@site/static/img/icon/lifeblog.png";
import note from "@site/static/img/icon/note.png";
import nas from "@site/static/img/icon/nas.png";

import homeBackGround from "@site/static/img/background/home_background.jpeg";
import homeBackGround1 from "@site/static/img/background/home_background1.jpeg";
import homeBackGround2 from "@site/static/img/background/home_background2.jpeg";

import PageProgressBar from "@site/src/components/PageProgressBar";
import Notification from "@site/src/components/Notification";

type HomepageHeaderProps = {
  isMobileDevice: boolean;
};

type ContactMeBtnProps = {
  readonly title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly src: any;
  link?: string;
  isCopyBtn?: boolean;
  copySuccess?: () => void;
};

export default function Home(): JSX.Element {
  return (
    <BrowserOnly fallback={undefined}>
      {() => {
        const isMobileDevice: boolean = isMobile();
        return (
          <Layout
            title="Home"
            description="Description will go into a meta tag in <head />"
          >
            <HomepageHeader isMobileDevice={isMobileDevice} />
            <main>
              <div className={styles.mainContainer}>
                {/* language */}
                <div className={styles.listTitle}>
                  {languagesMenuData.title}
                </div>
                <GridList data={languagesGridList} />

                {/* blockchain */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {blockchainMenuData.title}
                </div>
                <GridList data={blockchainGridList} />

                {/* database */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {databaseMenuData.title}
                </div>
                <GridList data={databaseGridList} />

                {/* devops */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {devopsMenuData.title}
                </div>
                <GridList data={devOpsGridList} />

                {/* security */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {securityMenuData.title}
                </div>
                <GridList data={securityGridList} />

                {/* framework */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {frameworkMenuData.title}
                </div>
                <GridList data={frameworkGridList} />

                {/* others */}
                <div className={clsx(styles.listTitle, styles.marginTop)}>
                  {othersMenuData.title}
                </div>
                <GridList data={othersGridList} />
              </div>
            </main>
          </Layout>
        );
      }}
    </BrowserOnly>
  );
}

function HomepageHeader({ isMobileDevice }: HomepageHeaderProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const TO_WIKI_BUTTON_TEXT = "Go to Wiki";
  const COPY_SUCCESS = "已复制到剪切板";
  const [show, setShow] = useState<boolean>(false);

  function copySuccess(): void {
    setShow(true);
    !show &&
      setTimeout(() => {
        setShow(false);
      }, 4000);
  }

  const randomNum = Math.floor(Math.random() * (10 - 1) + 1);
  let backgroundImage = homeBackGround;
  // 1,2,3,4,5,6,7,8,9,10
  if(randomNum >= 9) {
    backgroundImage = homeBackGround1;
  } else if (randomNum >= 8) {
    backgroundImage = homeBackGround2;
  }

  return (
    <header className={clsx(styles.heroBanner)} style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className={clsx(styles.heroTextContainer)}>
        {!isMobileDevice && (
          <div className={styles.avatarArea}>
            <img src={favicon} alt="dubuqingfeng" />
          </div>
        )}
        <div className={styles.heroTextArea}>
          <p className={styles.heroTextTitle}>{siteConfig.title}</p>
          <p className={styles.heroTextSubTitle}>{siteConfig.tagline}</p>
          <p className={styles.heroTextSubSubTitle}>{siteConfig.customFields.subSubTitle}</p>
          <div className={styles.heroTextAreaButton}>
            <Link
              className={clsx(
                "button",
                "button--secondary",
                "button--sm",
                styles.heroTextAreaButton
              )}
              to="/docs/"
            >
              {TO_WIKI_BUTTON_TEXT}
            </Link>
          </div>
        </div>
        <div className={styles.navLinkIconArea}>
          <ContactMeBtn title={contactMeData.lifeBlog} src={lifeblog} link={contactMeData.lifeBlog} />
          <ContactMeBtn title={contactMeData.techBlog} src={techblog} link={contactMeData.techBlog} />
          <ContactMeBtn title={contactMeData.sitenav} src={sitenav} link={contactMeData.sitenav} />
        </div>
        <div className={styles.navLinkIconArea}>
          <ContactMeBtn
            title={contactMeData.github}
            src={github}
            link={contactMeData.githubLink}
          />
          <ContactMeBtn
            title={contactMeData.telegram}
            src={telegram}
            link={contactMeData.telegramLink}
          />
          <ContactMeBtn
            title={contactMeData.gmail}
            src={gmail}
            link={contactMeData.gmailAddress}
            isCopyBtn
            copySuccess={copySuccess}
          />
          <ContactMeBtn title={contactMeData.twitter} src={twitter} link="/" />
          <ContactMeBtn
            title={contactMeData.wechat}
            src={wechat}
            link={contactMeData.wechatAccount}
            isCopyBtn
            copySuccess={copySuccess}
          />
          <ContactMeBtn title={contactMeData.zhihu} src={zhihu} link="/" />
        </div>
        <div className={styles.navLinkIconArea}>
          <ContactMeBtn title={contactMeData.internalNote} src={note} link={contactMeData.internalNote} />
          <ContactMeBtn title={contactMeData.internalNas} src={nas} link={contactMeData.internalNas} />
        </div>
        {!isMobileDevice && (
          <>
            <ArrowDownBtn />
            <PageProgressBar />
          </>
        )}
        <Notification show={show} title={COPY_SUCCESS} changeShow={setShow} />
      </div>
    </header>
  );
}

function ContactMeBtn({
  title,
  src,
  link,
  isCopyBtn = false,
  copySuccess,
}: ContactMeBtnProps): JSX.Element {
  if (isCopyBtn && typeof link !== "undefined") {
    return (
      <div
        className={styles.navLink}
        onClick={() => {
          setClipBoardText(link);
          copySuccess && copySuccess();
        }}
      >
        <div className={styles.imageWrapper}>
          <img src={src} alt={title} title={title} />
        </div>
      </div>
    );
  }
  return (
    <Link className={styles.navLink} to={link} href="_blank">
      <div className={styles.imageWrapper}>
        <img src={src} alt={title} title={title} />
      </div>
    </Link>
  );
}

function ArrowDownBtn(): JSX.Element {
  return (
    <span className={styles.arrowDownBtnWrapper}>
      <svg
        className={styles.arrowDownBtn}
        aria-hidden="true"
        viewBox="-75.52 -43.52 599.04 599.04"
        fill="currentColor"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
          });
        }}
      >
        <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" />
      </svg>
    </span>
  );
}
