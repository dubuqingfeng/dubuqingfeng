interface LanguagesMenuData {
  readonly title: string;

  readonly go: string;
  readonly cpp: string;
  readonly java: string;
  readonly php: string;
  readonly python: string;
  readonly markdown: string;
  readonly html: string;
  readonly css: string;
  readonly javascript: string;
  readonly typescript: string;
  readonly dart: string;
  readonly sql: string;
  readonly lua: string;
  readonly solidity: string;
  readonly nodejs: string;
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
  readonly cicd: string;
  readonly linux: string;
}

interface SecurityMenuData {
  readonly title: string;

  readonly web: string;
  readonly android: string;
  readonly bin: string;
  readonly solidity: string;
}

interface FrameworkMenuData {
  readonly title: string;

  readonly react: string;
  readonly vue: string;
  readonly laravel: string;
  readonly flutter: string;
  readonly android: string;
}

interface OthersMenuData {
  readonly title: string;
  readonly flink: string;
  readonly latex: string;
  readonly machinelearning: string;

  // readonly git: string;
  // readonly github: string;
  // readonly yaml: string;
  // readonly powershell: string;
  // readonly visual_studio_code: string;
  // readonly visual_studio: string;
  // readonly rider: string;
  // readonly webstorm: string;
  // readonly wechat_dev_tools: string;
}

// Languages
const LANGUAGES = "Languages";
const GO = "Go";
const CPP = "C++";
const JAVA = "Java";
const PHP = "PHP";
const PYTHON = "Python";
const MARKDOWN = "Markdown";
const HTML = "HTML";
const CSS = "CSS";
const JAVASCRIPT = "JavaScript"; 
const TYPESCRIPT = "TypeScript";
const DART = "Dart";
const SQL = "SQL";
const LUA = "Lua";
const SOLIDITY = "Solidity";
const NODEJS = "Node.js";

// Blockchain
const BLOCKCHAIN = "Blockchain";
const BITCOIN = "Bitcoin";
const ETHEREUM = "Ethereum";
const DEFI = "DeFi";

// Database
const DATABASE = "Database";
const MYSQL = "MySQL";
const REDIS = "Redis";
const MONGODB = "MongoDB";
const CLICKHOUSE = "ClickHouse";

// DevOps
const DEVOPS = "DevOps";
const DOCKER = "Docker";
const KUBERNETES = "Kubernetes";
const AWS = "AWS";
const CICD = "CI/CD";
const LINUX = "Linux";

// Security
const SECURITY = "Security";
const WEB = "Web";
const ANDROID = "Android";
const BIN = "Bin";
// const SOLIDITY = "Solidity";

// Framework
const FRAMEWORK = "Framework";
const REACT = "React";
const VUE = "Vue";
const LARAVEL = "Laravel";
const FLUTTER = "Flutter";
// const ANDROID = "Android";

// Others
const OTHERS = "Others";
const FLINK = "Flink";
const LATEX = "LaTeX";
const MACHINE_LEARNING = "Machine Learning";



// const REACT = "React";
// const DOCUSAURUS = "Docusaurus";
// const TAILWIND = "Tailwind";
// const SASS = "Sass";
// const WEXIN_MINIPROGRAM = "微信小程序";
// const NPM = "npm";
// const YARN = "Yarn";
// const VITE = "Vite";
// const GRAPHQL = "GraphQL";

// // Backend
// const BACKEND = "Blockchain";
// const CSHARP = "C#";
// const NODE_JS = "Node.js";
// const POSTGRESQL = "PostgreSQL";
// const MICROSOFT_SQLSERVER = "Microsoft SQL Server"; // Microsoft SQL Server
// const MONGODB = "MongoDB";
// const COSMOSDB = "CosmosDB";
// const REDIS = "Redis";
// const DOCKER = "Docker";
// const VERCEL = "Vercel";
// const MICROSOFT_AZURE = "Microsoft Azure"; // Microsoft Azure

// // 其他
// const BLOCKCHAIN = "Blockchain";
// const GIT = "Git";
// const GITHUB = "GitHub";
// const JSON = "JSON";
// const YAML = "YAML";
// const POWERSHELL = "PowerShell";
// const VISUAL_STUDIO_CODE = "Visual Studio Code";
// const VISUAL_STUDIO = "Visual Studio";
// const RIDER = "Rider";
// const WEBSTORM = "WebStorm";
// const WECHAT_DEV_TOOLS = "微信开发者工具";

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
  dart: DART,
  sql: SQL,
  lua: LUA,
  solidity: SOLIDITY,

  cpp: CPP,
  java: JAVA,
  php: PHP,
  python: PYTHON,
  nodejs: NODEJS,
};

const blockchainMenuData: BlockchainMenuData = {
  title: BLOCKCHAIN,
  bitcoin: BITCOIN,
  ethereum: ETHEREUM,
  defi: DEFI,
};

const databaseMenuData: DatabaseMenuData = {
  title: DATABASE,
  mysql: MYSQL,
  redis: REDIS,
  mongodb: MONGODB,
  clickhouse: CLICKHOUSE,
};

const devopsMenuData: DevOpsMenuData = {
  title: DEVOPS,
  docker: DOCKER,
  kubernetes: KUBERNETES,
  aws: AWS,
  cicd: CICD,
  linux: LINUX,
};

const securityMenuData: SecurityMenuData = {
  title: SECURITY,
  web: WEB,
  android: ANDROID,
  bin: BIN,
  solidity: SOLIDITY,
};

const frameworkMenuData: FrameworkMenuData = {
  title: FRAMEWORK,
  react: REACT,
  vue: VUE,
  laravel: LARAVEL,
  flutter: FLUTTER,
  android: ANDROID,
};

const othersMenuData: OthersMenuData = {
  title: OTHERS,
  flink: FLINK,
  latex: LATEX,
  machinelearning: MACHINE_LEARNING,
};

// Contact me
const GITHUB = "github";
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

export { languagesMenuData, blockchainMenuData, databaseMenuData, devopsMenuData, securityMenuData, frameworkMenuData, othersMenuData, contactMeData };