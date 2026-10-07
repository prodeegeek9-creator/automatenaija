// Publishes the daily blog posts written by the "Automate Naija — Daily Blog
// Post" n8n workflow.
//
// The workflow stores each post in the Supabase table blog_posts. This script,
// run by .github/workflows/publish-blog.yml, reads every generated post and,
// for any that does not have a page yet:
//
//   1. renders blog/<slug>.html from .github/blog/post-template.html,
//   2. adds a card for it at the top of blog/index.html,
//
// then rebuilds sitemap.xml from the pages on disk. A post whose page already
// exists is skipped, so running it twice is harmless and a page someone edits
// by hand is never overwritten.
//
// The post body comes from an AI model, so it is treated as untrusted: only a
// short list of tags survives, every attribute except a link's href is
// dropped, and links may only point at http(s) addresses or this site.
//
// No secrets: the publishable key below is the same public key the app ships
// to every browser, and row-level security only lets it read generated posts.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const SUPABASE_URL = 'https://okvpssmufcqmpglgehak.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_k4uMwxqorZoSgUnIo13xKA_1ZhUiPKo';
const SITE = 'https://automatenaija.com';
const MIN_WORDS = 700;

const ALLOWED = new Set(['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'a', 'blockquote', 'br']);

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Models sometimes slip Markdown inline code (`like this`) into HTML. Turn it
// into <code> everywhere except inside <pre>, where backticks may be real.
function inlineCode(html) {
  return String(html ?? '')
    .split(/(<pre[\s\S]*?<\/pre>)/i)
    .map((part) => (/^<pre/i.test(part) ? part : part.replace(/`([^`\n]{1,120})`/g, '<code>$1</code>')))
    .join('');
}

// Allow-list sanitiser for the model's HTML. Anything that is not a plain,
// allowed tag is escaped into visible text rather than silently passed on.
function sanitize(html) {
  const cleaned = String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|template)[\s\S]*?<\/\1\s*>/gi, '');

  return cleaned.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (tag, name, attrs) => {
    const n = name.toLowerCase();
    if (!ALLOWED.has(n)) return '';
    const closing = tag.startsWith('</');
    if (closing) return n === 'br' ? '' : `</${n}>`;
    if (n !== 'a') return `<${n}>`;
    const m = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = m ? (m[2] ?? m[3] ?? m[4] ?? '').trim() : '';
    if (/^https?:\/\//i.test(href)) {
      const internal = href.startsWith(SITE) || href.startsWith('https://app.automatenaija.com');
      return internal
        ? `<a href="${esc(href)}">`
        : `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">`;
    }
    if (/^(\/|#|\.\.?\/)/.test(href)) return `<a href="${esc(href)}">`;
    return '<a>';
  });
}

const wordCount = (html) =>
  (String(html ?? '').replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'.-]*/g) || []).length;

const lagosDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' });

// JSON inside <script> must not be able to close the tag.
const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function render(template, post) {
  const url = `${SITE}/blog/${post.slug}`;
  const faq = (Array.isArray(post.faq) ? post.faq : [])
    .filter((f) => f && f.q && f.a)
    .map((f) => ({ q: String(f.q).replace(/`/g, ''), a: String(f.a).replace(/`/g, '') }));

  const faqHtml = faq.length
    ? '      <h2>Frequently asked questions</h2>\n' +
      faq.map((f) => `      <h3>${esc(f.q)}</h3>\n      <p>${esc(f.a)}</p>`).join('\n') + '\n'
    : '';

  const graph = [
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description,
      datePublished: post.created_at,
      dateModified: post.created_at,
      inLanguage: 'en-NG',
      keywords: [post.primary_keyword, ...(post.secondary_keywords || [])].join(', '),
      wordCount: post.word_count,
      mainEntityOfPage: url,
      url,
      image: `${SITE}/assets/brand/og-image.png`,
      author: { '@type': 'Organization', name: 'Automate Naija', url: SITE },
      publisher: {
        '@type': 'Organization',
        name: 'Automate Naija',
        url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/assets/brand/logo-mark.svg` },
      },
    },
  ];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const values = {
    TITLE: esc(post.title),
    DESCRIPTION: esc(post.meta_description),
    CANONICAL: url,
    ISODATE: esc(post.created_at),
    DATE: esc(lagosDate(post.created_at)),
    KICKER: esc(post.kicker || 'Guide'),
    LEDE: esc(post.lede),
    READ: String(post.read_minutes || Math.max(3, Math.ceil(post.word_count / 220))),
    BODY: sanitize(inlineCode(post.body_html)),
    FAQ: faqHtml,
    JSONLD: jsonForScript({ '@context': 'https://schema.org', '@graph': graph }),
  };

  return template.replace(/%%([A-Z]+)%%/g, (whole, key) => (key in values ? values[key] : whole));
}

function card(post) {
  return `
      <a class="card post" href="${esc(post.slug)}.html">
        <div class="ptop"><span class="kicker">${esc(post.kicker || 'Guide')}</span><span>&middot;</span><span>${esc(lagosDate(post.created_at))}</span><span>&middot;</span><span>${esc(post.read_minutes)} min read</span></div>
        <h3>${esc(post.title)}</h3>
        <p>${esc(post.lede)}</p>
        <span class="more">Read the post &rarr;</span>
      </a>
`;
}

function sitemap(posts) {
  const dated = new Map(posts.map((p) => [`blog/${p.slug}.html`, p.created_at.slice(0, 10)]));
  const pages = readdirSync('.')
    .filter((f) => f.endsWith('.html'))
    .concat(readdirSync('blog').filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`));

  // Same spellings as the pages' own canonical links: /, /blog, /blog/<slug>.
  const loc = (file) =>
    file === 'index.html'
      ? SITE + '/'
      : SITE + '/' + file.replace(/\/index\.html$/, '').replace(/\.html$/, '');

  const urls = pages
    .sort()
    .map((file) => {
      const lastmod = dated.get(file);
      return `  <url><loc>${loc(file)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

async function fetchPosts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=*&origin=eq.auto&order=created_at.asc`,
    { headers: { apikey: PUBLISHABLE_KEY, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`Supabase answered ${res.status}: ${await res.text()}`);
  return res.json();
}

const template = readFileSync('.github/blog/post-template.html', 'utf8');
let index = readFileSync('blog/index.html', 'utf8');
const MARKER = '<!-- NEW POSTS: the Publish blog posts action adds each new card directly below this line. -->';
if (!index.includes(MARKER)) throw new Error('blog/index.html has lost its NEW POSTS marker');

const posts = await fetchPosts();
const published = [];

for (const post of posts) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug)) {
    console.warn(`Skipping a post with an unsafe slug: ${post.slug}`);
    continue;
  }
  const file = `blog/${post.slug}.html`;
  if (existsSync(file)) continue;
  const words = wordCount(post.body_html);
  if (words < MIN_WORDS) {
    console.warn(`Skipping ${post.slug}: ${words} words in the body`);
    continue;
  }
  writeFileSync(file, render(template, post));
  index = index.replace(MARKER, MARKER + '\n' + card(post));
  published.push(post.slug);
}

writeFileSync('blog/index.html', index);
writeFileSync('sitemap.xml', sitemap(posts));

console.log(published.length ? `Published: ${published.join(', ')}` : 'Nothing new to publish.');
