// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');

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
  projectName: 'Dubuqingfeng', // Usually your repo name.
  deploymentBranch: 'master',
  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    // defaultLocale: 'en-US',
    // locales: ['en-US', 'zh-Hans'],
    // localeConfigs: {
    //     'en-US': {
    //         label: 'English',
    //     },
    //     'zh-Hans': {
    //         label: '简体中文',
    //     },
    // },
  },
  themes: ["docusaurus-theme-openapi-docs"],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
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
        },
        blog: {
          routeBasePath: "blog",
          blogTitle: "Blog",
          blogDescription: "记录一些折腾、想法与踩坑笔记。",
          showReadingTime: true,
          postsPerPage: 10,
          blogSidebarTitle: "近期文章",
          blogSidebarCount: 10,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        debug: true,
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
        title: 'Dubuqingfeng',
        items: [
          {
            to: "/docs",
            // type: 'doc',
            // docId: 'intro',
            position: 'left',
            label: 'Intro',
          },
          {
            to: "/docs/wiki",
            position: 'left',
            label: 'Wiki',
          },
          {
            to: "/blog",
            position: "left",
            label: "Blog",
          },
          {
            to: "/sitenav",
            position: "left",
            label: "SiteNav",
          },
          {
            position: "left",
            label: "Tools",
            items: [
              {
                href: "https://json.cn",
                label: "JSON",
              },
              {
                label: "URL Parameter Tool",
                to: "/tools/urlparam",
              },
              {
                label: "Compare Text",
                to: "/tools/compare/text",
              },
              {
                label: "Compare Code",
                to: "/tools/compare/code",
              },
              {
                label: "Compare JSON",
                to: "/tools/compare/json",
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
          // {
          //   type: 'localeDropdown',
          //   position: 'right',
          // },
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
                label: 'Intro',
                to: '/docs',
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
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'diff', 'json'],
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
      [
        require.resolve("@cmfcmf/docusaurus-search-local"),
        {
          // Options here
        },
      ],
      [
        'docusaurus-plugin-content-gists',
        {
          id: "gists", // plugin id
          enabled: false,
          verbose: true,
          personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'token',
        },
      ],
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'openapi-classic',
          path: 'openapi',
          routeBasePath: 'openapi',
          docRootComponent: "@theme/DocRoot", // add @theme/DocRoot
          docItemComponent: "@theme/ApiItem" // Derived from docusaurus-theme-openapi-docs
          // sidebarPath: './sidebarsCommunity.js',
          // ... other options
        },
      ],
      [
        'docusaurus-plugin-openapi-docs',
        {
          id: "openapi", // plugin id
          docsPluginId: "openapi-classic", // id of plugin-content-docs or preset for rendering docs
          config: {
            okxord: {
              specPath: "src/openapi/okx/ord/openapi.json",
              outputDir: "openapi/okx-ord",
              sidebarOptions: { // optional, instructs plugin to generate sidebar.js
                groupPathsBy: "tag", // group sidebar items by operation "tag"
              },
            }
          }
        },
      ],
      [
        require.resolve("./plugins/blog-stats"),
        {
          blogPath: "blog",
        },
      ],
    ],
};

module.exports = config;
