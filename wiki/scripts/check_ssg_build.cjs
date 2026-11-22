// Check generated HTML encoding, six historical aliases in parsed DOM, and client isolation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const site = path.resolve(__dirname, '..');
const req = require('node:module').createRequire(path.join(site, 'package.json'));
async function main() {
  const build = path.resolve(process.argv[2]);
  const {parse} = await import(pathToFileURL(req.resolve('parse5')).href);
  const fixture = JSON.parse(fs.readFileSync(path.join(site, 'plans/wiki-legacy-routes.json')));
  const application = JSON.parse(fs.readFileSync(path.join(site, 'plans/uniswap-v3-ssg-application.json')));
  const files = [];
  function walk(dir) {for (const f of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, f.name); if (f.isDirectory()) walk(full); else files.push(full);
  }}
  walk(build);
  let htmlCount = 0, clientScripts = 0;
  for (const file of files) {
    if (file.endsWith('.html')) {
      htmlCount++;
      assert(!fs.readFileSync(file).includes(0), `NUL in ${file}`);
    }
    if (file.startsWith(path.join(build, 'assets/js') + path.sep) && file.endsWith('.js')) {
      clientScripts++;
      const js = fs.readFileSync(file, 'utf8');
      for (const marker of ['renderToReadableStream','node:stream/consumers','SsgRendererContract']) {
        assert(!js.includes(marker), `Server marker in client ${file}: ${marker}`);
      }
    }
  }
  assert(htmlCount > 0 && clientScripts > 0);
  const aliases = [];
  for (const {file, id} of application.aliases) {
    const record = fixture.legacy_routes.find(row => row.source === file);
    assert(record && record.heading_ids.includes(id), `Alias absent from fixed contract: ${file}`);
    const stem = path.join(build, record.url);
    const html = [stem, stem + '.html', path.join(stem,'index.html')].find(f => fs.existsSync(f) && fs.statSync(f).isFile());
    assert(html);
    const matches = [];
    function visit(node) {
      if (node.attrs?.some(attr => attr.name === 'id' && attr.value === id)) {
        const siblings = node.parentNode.childNodes.filter(n => n.tagName);
        const next = siblings[siblings.indexOf(node) + 1];
        matches.push({tag:node.tagName, next:next?.tagName});
      }
      for (const child of node.childNodes || []) visit(child);
    }
    visit(parse(fs.readFileSync(html, 'utf8')));
    assert.equal(matches.length, 1);
    assert.equal(matches[0].tag, 'span');
    assert(/^h[34]$/.test(matches[0].next));
    aliases.push({file,id,...matches[0]});
  }
  console.log(JSON.stringify({status:'passed',htmlCount,nulFiles:0,clientScripts,serverMarkersInClient:0,aliases}, null, 2));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
