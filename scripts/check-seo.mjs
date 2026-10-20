// Fails the build if the SEO output is wrong: every app route prerendered, unique titles and
// descriptions, canonical and sitemap in step, valid JSON-LD, a real 404, robots.txt pointing at the sitemap.
import { existsSync, readFileSync } from 'node:fs';

const fail = [];
const need = (ok, msg) => { if (!ok) fail.push(msg); };

// 1. every route in App.tsx has a static file (dynamic and wildcard routes are checked separately)
const routes = [...readFileSync('src/App.tsx', 'utf8').matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => !p.includes(':') && !p.includes('*'));
const fileFor = (p) => (p === '/' ? 'dist/index.html' : `dist${p}.html`);
for (const r of routes) need(existsSync(fileFor(r)), `no static page for route ${r}`);

// 2. each page: title, description, canonical, one h1, valid JSON-LD
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const titles = new Map(), descs = new Map();
for (const r of routes) {
  if (!existsSync(fileFor(r))) continue;
  const h = readFileSync(fileFor(r), 'utf8');
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canon = h.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const noindex = /<meta name="robots" content="noindex/.test(h);
  need(title && title.length <= 80, `${r}: bad title (${title?.length})`);
  need(desc && desc.length >= 50 && desc.length <= 165, `${r}: description length ${desc?.length}`);
  need(canon && canon.endsWith(r === '/' ? '/' : r), `${r}: canonical ${canon}`);
  need((h.match(/<h1[ >]/g) ?? []).length === 1, `${r}: needs exactly one h1 in the static content`);
  need((h.match(/<title>/g) ?? []).length === 1, `${r}: duplicate <title>`);
  need(noindex === !locs.includes(canon), `${r}: sitemap and robots meta disagree`);
  if (titles.has(title)) fail.push(`${r}: title also used by ${titles.get(title)}`); else titles.set(title, r);
  if (descs.has(desc)) fail.push(`${r}: description also used by ${descs.get(desc)}`); else descs.set(desc, r);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail.push(`${r}: invalid JSON-LD`); }
  }
}

// 3. sitemap, robots, 404
need(locs.length === new Set(locs).size, 'duplicate sitemap urls');
need(readFileSync('dist/robots.txt', 'utf8').includes('Sitemap: https://multitoolsuite.vercel.app/sitemap.xml'), 'robots.txt lacks the sitemap line');
need(/noindex/.test(readFileSync('dist/404.html', 'utf8')), '404.html must be noindex');
need(existsSync('dist/og-image.png'), 'dist/og-image.png missing (the share image)');

if (fail.length) { console.error('SEO check FAILED:\n - ' + fail.join('\n - ')); process.exit(1); }
console.log(`SEO check passed: ${routes.length} routes, ${locs.length} sitemap urls, unique titles and descriptions, JSON-LD valid, 404 + robots ok.`);
