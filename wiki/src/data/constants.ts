interface LanguagesMenuData {
  readonly title: string;

  readonly go: string;
  readonly markdown: string;
  readonly html: string;
  readonly css: string;
  readonly javascript: string;
  readonly typescript: string;
  readonly react: string;
  readonly docusaurus: string;
  readonly tailwind: string;
  readonly sass: string;
  readonly wexinMiniprogram: string;
  readonly npm: string;
  readonly yarn: string;
  readonly vite: string;
  readonly graphql: string;
}

interface BlockchainMenuData {
  readonly title: string;
  readonly bitcoin: string;
  readonly ethereum: string;
  readonly defi: string;
}

interface DatabaseMenuData {
  readonly title: string;
  readonly mysql: string;
  readonly redis: string;
  readonly mongodb: string;
  readonly clickhouse: string;
}

interface DevOpsMenuData {
  readonly title: string;
  readonly docker: string;
  readonly kubernetes: string;
  readonly aws: string;
}

interface SecurityMenuData {
  readonly title: string;
  readonly web: string;
  readonly android: string;
  readonly bin: string;
}

interface FrameworkMenuData {
  readonly title: string;
  readonly docker: string;
  readonly kubernetes: string;
  readonly aws: string;
}

interface OthersMenuData {
  readonly title: string;
  readonly flink: string;
  readonly latex: string;
  readonly aws: string;

  // readonly title: string;
  readonly git: string;
  readonly github: string;
  readonly yaml: string;
  readonly powershell: string;
  readonly visual_studio_code: string;
  readonly visual_studio: string;
  readonly rider: string;
  readonly webstorm: string;
  readonly wechat_dev_tools: string;
}

// Languages
const LANGUAGES = "Languages";
const MARKDOWN = "Markdown";
const HTML = "HTML";
const CSS = "CSS";
const JAVASCRIPT = "JavaScript";
const TYPESCRIPT = "TypeScript";
const REACT = "React";
const DOCUSAURUS = "Docusaurus";
const TAILWIND = "Tailwind";
const SASS = "Sass";
const WEXIN_MINIPROGRAM = "微信小程序";
const NPM = "npm";
const YARN = "Yarn";
const VITE = "Vite";
const GRAPHQL = "GraphQL";

// Backend
const BACKEND = "Blockchain";
const CSHARP = "C#";
const GO = "Go";
const NODE_JS = "Node.js";
const POSTGRESQL = "PostgreSQL";
const MICROSOFT_SQLSERVER = "Microsoft SQL Server"; // Microsoft SQL Server
const MONGODB = "MongoDB";
const COSMOSDB = "CosmosDB";
const REDIS = "Redis";
const DOCKER = "Docker";
const VERCEL = "Vercel";
const MICROSOFT_AZURE = "Microsoft Azure"; // Microsoft Azure

// 其他
const BLOCKCHAIN = "Blockchain";
const GIT = "Git";
const GITHUB = "GitHub";
const JSON = "JSON";
const YAML = "YAML";
const POWERSHELL = "PowerShell";
const VISUAL_STUDIO_CODE = "Visual Studio Code";
const VISUAL_STUDIO = "Visual Studio";
const RIDER = "Rider";
const WEBSTORM = "WebStorm";
const WECHAT_DEV_TOOLS = "微信开发者工具";

interface ContactMeData {
  readonly github: string;
  readonly telegram: string;
  readonly gmail: string;
  readonly twitter: string;
  readonly wechat: string;
  readonly zhihu: string;
  readonly githubLink: string;
  readonly telegramLink: string;
  readonly gmailAddress: string;
  readonly wechatAccount: string;
  // custom
  readonly lifeBlog: string;
  readonly techBlog: string;
  readonly sitenav: string;
}

const languagesMenuData: LanguagesMenuData = {
  title: LANGUAGES,

  go: GO,
  markdown: MARKDOWN,
  html: HTML,
  css: CSS,
  javascript: JAVASCRIPT,
  typescript: TYPESCRIPT,
  react: REACT,
  docusaurus: DOCUSAURUS,
  tailwind: TAILWIND,
  sass: SASS,
  wexinMiniprogram: WEXIN_MINIPROGRAM,
  npm: NPM,
  yarn: YARN,
  vite: VITE,
  graphql: GRAPHQL,
};

const blockchainMenuData: BlockchainMenuData = {
  title: BACKEND,
  csharp: CSHARP,
  go: GO,
  nodejs: NODE_JS,
  postgresql: POSTGRESQL,
  microsoft_sqlserver: MICROSOFT_SQLSERVER,
  mongodb: MONGODB,
  cosmosdb: COSMOSDB,
  redis: REDIS,
  docker: DOCKER,
  vercel: VERCEL,
  azure: MICROSOFT_AZURE,
};

const othersMenuData: OthersMenuData = {
  title: BLOCKCHAIN,
  git: GIT,
  github: GITHUB,
  yaml: YAML,
  powershell: POWERSHELL,
  visual_studio_code: VISUAL_STUDIO_CODE,
  visual_studio: VISUAL_STUDIO,
  rider: RIDER,
  webstorm: WEBSTORM,
  wechat_dev_tools: WECHAT_DEV_TOOLS,
};

// Contact me
const TELEGRAM = "Telegram";
const GMAIL = "GMail";
const TWITTER = "Twitter";
const WECHAT = "微信";
const ZHIHU = "知乎";
const GITHUB_LINK = "https://github.com/dubuqingfeng/";
const TELEGRAM_LINK = "https://t.me/dubuqingfeng/";
const GMAIL_ADDRESS = "moyishizhe@gmail.com";
const WECHAT_ACCOUNT = "dubuqingfeng";
const SITENAV_LINK = "https://sitenav.link";
const LIFE_BLOG_LINK = "https://xiaoye.me";
const TECH_BLOG_LINK = "https://dbqf.xyz";

const contactMeData: ContactMeData = {
  github: GITHUB,
  telegram: TELEGRAM,
  gmail: GMAIL,
  twitter: TWITTER,
  wechat: WECHAT,
  zhihu: ZHIHU,
  githubLink: GITHUB_LINK,
  telegramLink: TELEGRAM_LINK,
  gmailAddress: GMAIL_ADDRESS,
  wechatAccount: WECHAT_ACCOUNT,
  sitenav: SITENAV_LINK,
  lifeBlog: LIFE_BLOG_LINK,
  techBlog: TECH_BLOG_LINK,
};

export { languagesMenuData, blockchainMenuData, othersMenuData, contactMeData };
