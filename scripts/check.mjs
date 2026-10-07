import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const routes=JSON.parse(await readFile(path.join(root,'routes.json'),'utf8'));
assert(routes.length >= 23,'Expected at least all 23 originally requested pages');
assert.equal(new Set(routes.map(r=>r.path)).size,routes.length,'Duplicate routes');
const known=new Set(routes.map(r=>r.path));
let checked=0;
for(const route of routes){
 const html=await readFile(path.join(root,route.source),'utf8');
 assert.match(html,/<header\b/); assert.match(html,/<footer\b/); assert.match(html,/<title>/);
 assert(!html.includes('__reactRouterContext'),'Original server/router scripts must be removed');
 assert(!/<script[^>]*>[^<]+<\/script>/.test(html),'Unexpected inline executable script');
 for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const target=match[1].split(/[?#]/)[0];
  if(target.startsWith('/assets/')){await access(path.join(root,'public',target));checked++;}
  else if(target.startsWith('/')) assert(known.has(target.replace(/\/$/,'')||'/'),`Missing route ${target}`);
 }
 for(const match of html.matchAll(/https?:\/\/[^\s"<>]*\.(?:jpg|jpeg|png|webp|woff2?|ttf)(?:[?\s"<>]|$)/g)){
  assert(!html.includes(`src="${match[0]}`),'Remote image dependency');
 }
}
const assets=JSON.parse(await readFile(path.join(root,'asset-manifest.json'),'utf8'));
for(const asset of Object.values(assets)){assert(!asset.error);await access(path.join(root,'public',asset.local));}
const fontCss=await readFile(path.join(root,'public/assets/fonts.css'),'utf8');
assert(!fontCss.includes('https://'),'Fonts must load locally');
for(const family of ['Inter','Source Serif 4','Playfair Display','JetBrains Mono'])assert(fontCss.includes(family),`Missing font ${family}`);
new vm.Script(await readFile(path.join(root,'public/assets/frontend.js'),'utf8'));
console.log(`Passed: ${routes.length} routes, ${Object.keys(assets).length} asset references, four font families, ${checked} page resource links, JavaScript syntax.`);
