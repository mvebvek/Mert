// Builds the static site into dist/: wraps each page in src/pages with the shared
// partials, fills {{placeholders}} from site.config.json, and writes sitemap.xml and robots.txt.
// No dependencies; run with `node build.mjs`.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const root = import.meta.dirname;
const out = join(root, 'dist');
const site = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));
const siteUrl = site.url.replace(/\/+$/, '') + '/';
const partial = name => readFileSync(join(root, 'src/partials', name + '.html'), 'utf8');
const [head, header, footer] = ['head', 'header', 'footer'].map(partial);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pending = '<span class="todo">eklenecek</span>';
const handle = site.instagram.replace(/^@/, '');
const contact = {
  email: site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : pending,
  instagram: handle ? `<a href="https://www.instagram.com/${esc(handle)}/" target="_blank" rel="noopener">@${esc(handle)}</a>` : pending,
};

function parse(file) {
  const src = readFileSync(join(root, 'src/pages', file), 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(m[1].split('\n').map(l => {
    const i = l.indexOf(':');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }));
  return { meta, body: src.slice(m[0].length) };
}

function fill(html, page, file) {
  return html
    .replace(/\{\{current:(\w+)\}\}/g, (_, k) => (k === page.meta.nav ? ' aria-current="page"' : ''))
    .replace(/\{\{title\}\}/g, esc(page.meta.title))
    .replace(/\{\{description\}\}/g, esc(page.meta.description))
    .replace(/\{\{canonical\}\}/g, siteUrl + (file === 'index.html' ? '' : file))
    .replace(/\{\{contact\.(\w+)\}\}/g, (_, k) => contact[k])
    .replace(/\{\{site\.(\w+)\}\}/g, (_, k) => esc(site[k] ?? ''));
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

const indexed = [];
for (const file of readdirSync(join(root, 'src/pages')).filter(f => f.endsWith('.html')).sort()) {
  const page = parse(file);
  let top = head;
  if (page.meta.noindex) top = top.replace('</title>', '</title>\n<meta name="robots" content="noindex">');
  // 404 is served from any path, so resolve its relative links against the site root
  if (file === '404.html') top = top.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<base href="${new URL(siteUrl).pathname}">`);
  const html = fill(top + header + page.body + footer, page, file);
  const left = html.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`${file}: unfilled placeholder ${left[0]}`);
  writeFileSync(join(out, file), html);
  if (!page.meta.noindex) indexed.push(file);
}

writeFileSync(join(out, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  indexed.map(f => `  <url><loc>${siteUrl}${f === 'index.html' ? '' : f}</loc></url>`).join('\n') +
  '\n</urlset>\n');
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built ${indexed.length + 1} pages into dist/`);
