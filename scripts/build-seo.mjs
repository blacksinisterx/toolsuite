// Runs after `vite build`. Turns the single-page app into one static HTML file per route
// (own title, description, canonical, Open Graph, JSON-LD and crawlable links), and writes
// sitemap.xml, robots.txt and a real 404.html into dist/. The app still takes over on load.
// Page data comes from src/lib/seo.ts, the same module the app uses at runtime.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { build } from 'esbuild';

const bundled = await build({
  entryPoints: ['src/lib/seo.ts'], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'error',
});
const { SITE, SITE_NAME, OG_IMAGE, allPages } = await import(
  'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64')
);
const registry = await build({
  entryPoints: ['src/lib/registry.ts'], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'error',
});
const { CATEGORIES, TOOLS, toolsByCategory } = await import(
  'data:text/javascript;base64,' + Buffer.from(registry.outputFiles[0].text).toString('base64')
);

const AUTHOR = { '@type': 'Person', name: 'Aiza Ali', url: 'https://storm-bureau-portfolio.vercel.app/' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (path) => SITE + (path === '/' ? '/' : path);
const template = readFileSync('dist/index.html', 'utf8');
const label = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

let lastmod;
try { lastmod = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || undefined; } catch { /* no git on the build machine: omit lastmod */ }

const APP_CATEGORY = { video: 'MultimediaApplication', audio: 'MultimediaApplication', images: 'MultimediaApplication', developer: 'DeveloperApplication' };

function jsonLd(page) {
  const crumbs = (items) => ({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(path) })),
  });
  if (page.kind === 'home') {
    return [{
      '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: url('/'), description: page.description, inLanguage: 'en', author: AUTHOR,
    }];
  }
  if (page.kind === 'category') {
    const id = page.path.split('/').pop();
    return [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: page.title, url: url(page.path), description: page.description,
        mainEntity: { '@type': 'ItemList', itemListElement: toolsByCategory(id).map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: url(t.path) })) } },
      crumbs([['Home', '/'], [label(id), page.path]]),
    ];
  }
  if (page.kind === 'tool') {
    const t = page.tool;
    return [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, url: url(t.path), description: page.description,
        applicationCategory: APP_CATEGORY[t.category] ?? 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: AUTHOR,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: url('/') } },
      crumbs([['Home', '/'], [label(t.category), `/category/${t.category}`], [t.name, t.path]]),
    ];
  }
  return [];
}

function head(page) {
  const canonical = url(page.path);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    ...(page.noindex ? ['<meta name="robots" content="noindex, follow" />'] : ['<meta name="robots" content="index, follow, max-image-preview:large" />']),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="ToolSuite: free online tools that run in your browser" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...jsonLd(page).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`),
  ];
  return tags.join('\n    ');
}

const link = (t) => `<li><a href="${t.path}">${esc(t.name)}</a>: ${esc(t.description)}</li>`;

// Visible until the app mounts, and what a crawler without JavaScript reads. React replaces it.
function body(page) {
  const wrap = (inner) => `<main id="seo-static" style="max-width:46rem;margin:0 auto;padding:2.5rem 1rem;line-height:1.6;font-family:system-ui,sans-serif">${inner}</main>`;
  if (page.kind === 'home') {
    return wrap(`<h1>${esc(page.h1)}</h1><p>${esc(page.description)}</p>` + CATEGORIES.map((c) => {
      const ts = toolsByCategory(c.id);
      return `<h2><a href="/category/${c.id}">${esc(c.label)}</a></h2><p>${esc(c.description)}</p><ul>${ts.map(link).join('')}</ul>`;
    }).join(''));
  }
  if (page.kind === 'category') {
    const id = page.path.split('/').pop();
    return wrap(`<nav aria-label="Breadcrumb"><a href="/">Home</a> / ${esc(label(id))}</nav><h1>${esc(page.h1)}</h1><p>${esc(page.description)}</p><ul>${toolsByCategory(id).map(link).join('')}</ul>`);
  }
  if (page.kind === 'tool') {
    const t = page.tool;
    const privacy = t.processing === 'client' ? 'Processed locally in your browser. Nothing you add is uploaded.' : 'Processed temporarily on a server and deleted right after.';
    const more = toolsByCategory(t.category).filter((x) => x.id !== t.id);
    return wrap(`<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/category/${t.category}">${esc(label(t.category))}</a> / ${esc(t.name)}</nav><h1>${esc(t.name)}</h1><p>${esc(t.description)}</p><p><strong>${privacy}</strong></p>` +
      (more.length ? `<h2>More ${esc(label(t.category))} tools</h2><ul>${more.map(link).join('')}</ul>` : '') +
      `<p><a href="/">All ${TOOLS.length} tools</a></p>`);
  }
  return wrap(`<h1>${esc(page.h1)}</h1><p>${esc(page.description)}</p><p><a href="/">All tools</a></p>`);
}

function render(page) {
  let html = template.replace(/<title>[\s\S]*?<\/title>\s*/, '').replace(/<meta name="description"[^>]*>\s*/, '');
  html = html.replace('</head>', `    ${head(page)}\n  </head>`);
  return html.replace('<div id="root"></div>', `<div id="root">${body(page)}</div>`);
}

const pages = allPages();
for (const p of pages) {
  const file = p.path === '/' ? 'dist/index.html' : `dist${p.path}.html`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(p));
}

// A real 404: the old catch-all served the home page with status 200 for every unknown URL.
const css = template.match(/<link rel="stylesheet"[^>]*>/)?.[0] ?? '';
writeFileSync('dist/404.html', `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Page not found | ${SITE_NAME}</title><meta name="robots" content="noindex" /><link rel="icon" type="image/svg+xml" href="/favicon.svg" />${css}</head>
<body><main style="max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.6;font-family:system-ui,sans-serif"><h1>Page not found</h1><p>That page does not exist. Try the <a href="/">full list of ${TOOLS.length} tools</a>.</p></main></body></html>
`);

writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
const urls = pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${url(p.path)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
console.log(`SEO: ${pages.length} pages, ${urls.length} in sitemap, robots.txt, 404.html`);
