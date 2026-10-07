import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {rewriteInvestLinks} from '../public/assets/invest-links.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output = path.join(root,'dist');
const routes = JSON.parse(await readFile(path.join(root,'routes.json'),'utf8'));
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await cp(path.join(root,'public'),output,{recursive:true});
for (const route of routes) {
  const directory = path.join(output,route.path.replace(/^\//,''));
  await mkdir(directory,{recursive:true});
  let html = rewriteInvestLinks(await readFile(path.join(root,route.source),'utf8'));
  // New registered pages receive both shared behavior scripts automatically.
  if (!html.includes('src="/assets/frontend.js"')) {
    html = html.replace('</body>', '<script defer src="/assets/frontend.js"></script></body>');
  }
  if (!html.includes('src="/assets/invest-links.js"')) {
    html = html.replace('</body>', '<script type="module" src="/assets/invest-links.js"></script></body>');
  }
  await writeFile(path.join(directory,'index.html'),html);
}
const error = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Equilibria</title><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/original.css"></head><body class="bg-paper text-ink"><main class="container mx-auto max-w-6xl px-4 py-20"><a class="eq-wordmark" href="/">Equilibria<span class="eq-wordmark-dot">.</span></a><h1 class="eq-headline mt-10 text-4xl">Page not found</h1><p class="mt-5 text-muted-foreground">Return to the homepage to explore Equilibria.</p><a class="mt-8 inline-block text-accent" href="/">Back to home →</a></main></body></html>';
await writeFile(path.join(output,'404.html'),error);
console.log(`Built ${routes.length} pages with local assets in dist/.`);
