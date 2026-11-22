// Exercise the actual adapter, React's UTF-8 boundaries and Docusaurus replacement scope.
// No install, network or server; --site-dir selects an isolated checkout.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const site = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const req = require('node:module').createRequire(path.join(site, 'package.json'));
const React = req('react');
const pipeable = req('react-dom/server');
const {PassThrough, Readable} = require('node:stream');
const {text} = require('node:stream/consumers');
const e = React.createElement;
const unhandled = [];
process.on('unhandledRejection', error => unhandled.push(error));
function loadAdapter(overrides = {}) {
  const source = fs.readFileSync(path.join(site, 'src/ssg/renderToHtml.js'), 'utf8')
    .replace(/import \{([^}]+)\} from '([^']+)';/g,
      (_, names, id) => `const {${names}} = require(${JSON.stringify(id)});`)
    .replace('export function renderToHtml', 'function renderToHtml');
  return new Function('require', source + '\nreturn renderToHtml;')(
    id => Object.hasOwn(overrides, id) ? overrides[id] : req(id));
}
async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('SSR timeout after 500ms')), 500);
    })]);
  } finally { clearTimeout(timer); }
}
async function rejectsSame(promise, expected) {
  let rejected = false;
  await bounded(promise).then(() => {}, error => {
    rejected = true;
    assert.equal(error, expected);
  });
  assert(rejected, 'must reject, including falsy thrown values');
}
function checkPlugin() {
  const factory = req('./src/plugins/customWebpack5Plugin.js');
  const webpack = req('webpack');
  const configure = isServer => factory().configureWebpack({}, isServer, {});
  const client = configure(false), server = configure(true);
  const replacements = options => options.plugins.filter(p => p instanceof webpack.NormalModuleReplacementPlugin);
  assert.equal(replacements(client).length, 0);
  assert.equal(replacements(server).length, 1);
  let replace;
  replacements(server)[0].apply({hooks:{normalModuleFactory:{tap(_name, callback) {
    callback({hooks:{beforeResolve:{tap(_n, fn) {replace = fn;}}, afterResolve:{tap() {}}}});
  }}}});
  const context = path.dirname(req.resolve('@docusaurus/core/lib/client/renderToHtml'));
  const lifecycle = {};
  const guard = server.plugins.find(p => !(p instanceof webpack.NormalModuleReplacementPlugin) && !(p instanceof webpack.ProvidePlugin));
  guard.apply({hooks:Object.fromEntries(['beforeCompile', 'afterCompile'].map(name => [name,{tap(_n, fn) {lifecycle[name] = fn;}}]))});
  lifecycle.beforeCompile();
  assert.throws(lifecycle.afterCompile, /got 0/);
  const otherContext = {request:'./renderToHtml', context:'/unrelated'};
  const otherModule = {request:'./renderToHtml.js', context};
  replace(otherContext); replace(otherModule);
  assert.equal(otherContext.request, './renderToHtml');
  assert.equal(otherModule.request, './renderToHtml.js');
  const target = {request:'./renderToHtml', context};
  replace(target);
  assert.equal(target.request, path.join(site, 'src/ssg/renderToHtml.js'));
  lifecycle.afterCompile();
  replace({request:'./renderToHtml', context});
  assert.throws(lifecycle.afterCompile, /got 2/);
  return {clientReplacements:0, exactServerTarget:1, unrelatedUnchanged:true, missingOrDuplicateFails:true};
}
async function main() {
  const renderWeb = loadAdapter();
  const result = {node:process.version,mode:process.env.NODE_ENV || 'development',react:React.version,casesChecked:200,pipeableNulCases:0};
  for (let n = 100; n < 300; n++) {
    const app = e('div', null,
      ...Array.from({length:n}, (_, i) => e('span', {key:i}, 'x')),
      e('h3', {id:'资源限制'}, '资源限制'));
    const stream = new PassThrough();
    const {pipe} = pipeable.renderToPipeableStream(app, {onAllReady() {pipe(stream);}});
    const current = await text(stream);
    const fixed = await bounded(renderWeb(app));
    assert.equal(fixed, pipeable.renderToString(app));
    assert(!fixed.includes('\0'));
    if (current.includes('\0')) result.pipeableNulCases++;
  }
  const boundary = child => e(React.Suspense, {fallback:e('p', null, 'pending-fallback')}, child);
  const failure = new Error('expected-render-error');
  function Broken() {throw failure;}
  function Never() {throw new Promise(() => {});}
  await rejectsSame(renderWeb(e(Broken)), failure);
  await rejectsSame(renderWeb(boundary(e(Broken))), failure);
  await rejectsSame(renderWeb(e('div', null, boundary(e(Broken)), boundary(e(Never)))), failure);
  for (const value of [0, false, '', null, undefined]) {
    function Falsy() {throw value;}
    await rejectsSame(renderWeb(boundary(e(Falsy))), value);
  }
  let ready = false;
  const pending = new Promise(resolve => setTimeout(() => {ready = true; resolve();}, 10));
  function AsyncContent() {if (!ready) throw pending; return e('h3', null, '异步内容');}
  const suspended = await bounded(renderWeb(boundary(e(AsyncContent))));
  assert(suspended.includes('异步内容'));
  assert(!suspended.includes('pending-fallback'));
  // Inject each stream failure independently to verify every rejection is connected.
  for (const stage of ['creation', 'allReady', 'text', 'synchronous']) {
    const error = new Error(stage);
    const renderer = loadAdapter({'react-dom/server.browser':{renderToReadableStream() {
      if (stage === 'synchronous') throw error;
      if (stage === 'creation') return Promise.reject(error);
      const stream = stage === 'text'
        ? new ReadableStream({start(controller) {controller.error(error);}})
        : Readable.toWeb(Readable.from(['ok']));
      stream.allReady = stage === 'allReady' ? Promise.reject(error) : Promise.resolve();
      return Promise.resolve(stream);
    }}});
    await rejectsSame(renderer(null), error);
  }
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.deepEqual(unhandled, []);
  result.actualAdapterPath = path.join(site, 'src/ssg/renderToHtml.js');
  result.webMatchesAllCases = true;
  result.boundedErrors = ['top','nested','pending-sibling','0','false','empty-string','null','undefined'];
  result.streamRejections = ['creation','allReady','text','synchronous'];
  result.suspenseWaitsForContent = true;
  result.unhandledRejections = unhandled.length;
  result.plugin = checkPlugin();
  console.log(JSON.stringify(result, null, 2));
}
main().catch(error => {console.error(error);process.exitCode = 1;});
