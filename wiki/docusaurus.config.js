// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dubuqingfeng',
  tagline: '一个自我整理与实践的地方',
  customFields: {
    subSubTitle: '效率提升 · 实验室 · 公开 Wiki',
  },
  url: 'https://dubuqingfeng.xyz',
  baseUrl: '/',
  baseUrlIssueBanner: true,
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'dubuqingfeng', // Usually your GitHub org/user name.
  projectName: 'dubuqingfeng', // Usually your repo name.
  deploymentBranch: 'master',
  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  themes: ["@docusaurus/theme-live-codeblock"],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          include: ["**/*.md", "**/*.mdx"],
          exclude: [
            "**/_*.{js,jsx,ts,tsx,md,mdx}",
            "**/_*/**",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
          ],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // announcementBar: {
      //   id: "support_us",
      //   content:
      //     "新版试运行...",
      //   backgroundColor: "#fafbfc",
      //   textColor: "#091E42",
      //   isCloseable: true,
      // },
      navbar: {
        title: 'dubuqingfeng',
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'intro',
          },
          {
            to: "/docs/wiki",
            position: 'left',
            label: 'wiki',
          },
          {
            position: "left",
            label: "Tools",
            items: [
              {
                href: "https://json.cn",
                label: "json",
              },
            ],
          },
          {
            position: "left",
            label: "Blockchain",
            items: [
              {
                label: "Decode Tx",
                to: "/tools/blockchain/decodetx",
              },
              {
                label: "Publish Tx",
                to: "/tools/blockchain/publishtx",
              },
              {
                label: "Run RPC",
                to: "/tools/blockchain/runrpc?node=ethereum&rpc=eth_blockNumber",
              },
            ],
          },
          {
            href: 'https://github.com/dubuqingfeng',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Internal',
            items: [
              {
                label: 'Crawlab',
                href: 'http://crawlab.lab',
              },
              {
                label: 'Note',
                href: 'http://note.lab',
              },
              {
                label: 'NAS',
                href: 'http://nas.lab',
              },
              {
                label: 'Coder',
                href: 'http://coder.lab',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/dubuqingfeng',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dubuqingfeng, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
    plugins: [
      require.resolve('./src/plugins/customWebpack5Plugin.js'),
      async function myPlugin(context, options) {
        return {
          name: "docusaurus-tailwindcss",
          configurePostCss(postcssOptions) {
            // Appends TailwindCSS and AutoPrefixer.
            postcssOptions.plugins.push(require("tailwindcss"));
            postcssOptions.plugins.push(require("autoprefixer"));
            return postcssOptions;
          },
        };
      },
    ],
};

module.exports = config;
