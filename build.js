#!/usr/bin/env node
/**
 * Build Script for 2D Aquatic
 *
 * Đọc files markdown trong content/ và generate:
 * - JSON indexes (cho dynamic loading)
 * - Static HTML pages cho từng bài viết / sản phẩm
 * - Update sitemap.xml
 *
 * Chạy tự động bởi Netlify mỗi khi có thay đổi content.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_DIR = ROOT;

// ===== Helpers =====

function parseMarkdown(content) {
  // Parse frontmatter (giữa hai dòng ---)
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const frontmatter = match[1];
  const body = match[2];

  const meta = {};
  let currentKey = null;
  let currentList = null;
  let currentObject = null;

  // YAML parser đơn giản (đủ dùng cho frontmatter cơ bản)
  frontmatter.split('\n').forEach(line => {
    if (!line.trim()) return;

    // Top level key
    const topMatch = line.match(/^(\w+):\s*(.*)$/);
    if (topMatch) {
      const [, key, value] = topMatch;
      currentKey = key;
      currentList = null;
      currentObject = null;

      if (value === '' || value === undefined) {
        // Multi-line value coming
        return;
      }

      // Parse value
      let parsed = value.trim();
      if (parsed.startsWith('"') && parsed.endsWith('"')) {
        parsed = parsed.slice(1, -1);
      }
      if (parsed === 'true') parsed = true;
      else if (parsed === 'false') parsed = false;
      else if (/^-?\d+$/.test(parsed)) parsed = parseInt(parsed);
      else if (/^-?\d+\.\d+$/.test(parsed)) parsed = parseFloat(parsed);

      meta[key] = parsed;
    }
    // List item
    else if (line.match(/^\s*-\s+/)) {
      const item = line.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];

      // Check if it's an object (key: value pair)
      const objMatch = item.match(/^(\w+):\s*(.*)$/);
      if (objMatch) {
        const obj = {};
        let v = objMatch[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        obj[objMatch[1]] = v;
        meta[currentKey].push(obj);
        currentObject = obj;
      } else {
        // Plain string
        let v = item;
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        meta[currentKey].push(v);
      }
    }
    // Nested key (in object)
    else if (line.match(/^\s+\w+:/)) {
      const nestedMatch = line.trim().match(/^(\w+):\s*(.*)$/);
      if (nestedMatch && currentObject) {
        let v = nestedMatch[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        currentObject[nestedMatch[1]] = v;
      }
    }
  });

  return { meta, body };
}

function readContentDir(subdir) {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.json'))
    .map(filename => {
      const filepath = path.join(dir, filename);
      const content = fs.readFileSync(filepath, 'utf-8');

      if (filename.endsWith('.json')) {
        return { ...JSON.parse(content), filename };
      }

      const { meta, body } = parseMarkdown(content);
      return { ...meta, body, filename };
    });
}

function markdownToHtml(md) {
  // Simple markdown to HTML converter (đủ dùng cho blog posts)
  return md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold/Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    // Lists
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li)/g, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .split(/\n\n+/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.match(/^<(h\d|ul|ol|li|p|div|img|blockquote)/)) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n\n');
}

// ===== BUILD ARTICLES =====

function buildArticles() {
  console.log('📝 Building articles...');
  const articles = readContentDir('articles');
  const blogDir = path.join(OUTPUT_DIR, 'blog');
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

  // Generate index JSON
  const index = articles
    .filter(a => a.published !== false)
    .map(a => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      cover: a.cover,
      author: a.author,
      date: a.date,
      category: a.category,
      tags: a.tags,
      featured: a.featured
    }));

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'articles-index.json'),
    JSON.stringify(index, null, 2)
  );
  console.log(`  ✓ Generated articles-index.json (${index.length} articles)`);

  // Generate HTML for each article
  articles.forEach(article => {
    if (article.published === false) return;

    const html = renderArticleHtml(article);
    const articleDir = path.join(blogDir, article.slug);
    if (!fs.existsSync(articleDir)) fs.mkdirSync(articleDir, { recursive: true });

    fs.writeFileSync(path.join(articleDir, 'index.html'), html);
    console.log(`  ✓ Generated /blog/${article.slug}/`);
  });

  return articles;
}

function renderArticleHtml(article) {
  const date = new Date(article.date).toISOString();
  const dateDisplay = new Date(article.date).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const seo = article.seo || {};
  const metaTitle = seo.meta_title || `${article.title} | 2D Aquatic`;
  const metaDesc = seo.meta_description || article.excerpt;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0a1628">

<title>${metaTitle}</title>
<meta name="description" content="${metaDesc}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="${article.author || '2D Aquatic'}">
<link rel="canonical" href="https://2daquatic.com/blog/${article.slug}">

<meta property="og:type" content="article">
<meta property="og:url" content="https://2daquatic.com/blog/${article.slug}">
<meta property="og:title" content="${article.title}">
<meta property="og:description" content="${article.excerpt || ''}">
<meta property="og:image" content="https://2daquatic.com${article.cover || '/images/og-image.jpg'}">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="2D Aquatic">
<meta property="article:published_time" content="${date}">
<meta property="article:author" content="${article.author || '2D Aquatic'}">

<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/seo-additions.css">

<style>
.article-hero {
  padding: 60px 24px 40px;
  text-align: center;
  background: linear-gradient(135deg, #f5f3ec 0%, #fafaf7 100%);
}
.article-hero .breadcrumb {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 16px;
}
.article-hero .breadcrumb a { color: var(--muted); text-decoration: none; }
.article-hero h1 {
  font-family: var(--display);
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 600;
  margin-bottom: 16px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.2;
}
.article-meta-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 32px;
}
.article-cover-img {
  max-width: 1200px;
  margin: 0 auto;
  aspect-ratio: 16/9;
  background: #f5f3ec;
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  overflow: hidden;
}
.article-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 60px 24px;
  font-size: 17px;
  line-height: 1.8;
  color: #2a3340;
}
.article-content h2 {
  font-family: var(--display);
  font-size: 32px;
  font-weight: 600;
  margin: 48px 0 16px;
  color: var(--ink);
}
.article-content h3 {
  font-family: var(--display);
  font-size: 22px;
  font-weight: 600;
  margin: 32px 0 12px;
  color: var(--ink);
}
.article-content p { margin-bottom: 20px; }
.article-content ul, .article-content ol {
  margin: 0 0 20px 0;
  padding-left: 24px;
}
.article-content li { margin-bottom: 8px; }
.article-content a { color: var(--reef); }
.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 24px 0;
}
.article-content strong { color: var(--ink); font-weight: 600; }
.article-cta {
  background: var(--ink);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  margin: 48px 0;
}
.article-cta h3 { color: white; margin-bottom: 16px; }
.article-cta a {
  display: inline-block;
  background: var(--coral);
  color: white;
  padding: 12px 28px;
  border-radius: 999px;
  text-decoration: none;
  margin-top: 16px;
  font-weight: 500;
}
</style>

<!-- Schema.org: Article -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${JSON.stringify(article.title)},
  "image": "https://2daquatic.com${article.cover || '/images/og-image.jpg'}",
  "datePublished": "${date}",
  "dateModified": "${date}",
  "author": {
    "@type": "Person",
    "name": ${JSON.stringify(article.author || '2D Aquatic')}
  },
  "publisher": {
    "@type": "Organization",
    "name": "2D Aquatic",
    "logo": {
      "@type": "ImageObject",
      "url": "https://2daquatic.com/images/logo-light.png"
    }
  },
  "description": ${JSON.stringify(article.excerpt || '')},
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://2daquatic.com/blog/${article.slug}"
  }
}
</script>

<!-- Schema.org: BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://2daquatic.com/"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://2daquatic.com/blog"},
    {"@type": "ListItem", "position": 3, "name": ${JSON.stringify(article.title)}, "item": "https://2daquatic.com/blog/${article.slug}"}
  ]
}
</script>

<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
<a class="skip-to-content" href="#main">Đi đến nội dung chính</a>

<nav>
  <div class="nav-inner">
    <a href="/" class="logo" aria-label="2D Aquatic">
      <img class="logo-light" src="/images/logo-light.png" srcset="/images/logo-light.png 1x, /images/logo-light@2x.png 2x" alt="2D Aquatic" width="184" height="80">
    </a>
    <ul class="nav-links">
      <li><a href="/">Trang chủ</a></li>
      <li><a href="/be-ca">Bể cá</a></li>
      <li><a href="/san-pham">Sản phẩm</a></li>
      <li><a href="/dich-vu">Dịch vụ</a></li>
      <li><a href="/blog" aria-current="page">Blog</a></li>
      <li><a href="/ho-tro">Hỗ trợ</a></li>
      <li><a href="/lien-he">Liên hệ</a></li>
    </ul>
  </div>
</nav>

<main id="main">
  <header class="article-hero">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Trang chủ</a> · <a href="/blog">Blog</a> · <span>${article.title}</span>
    </nav>
    <h1>${article.title}</h1>
    <div class="article-meta-bar">
      <span>👤 ${article.author || '2D Aquatic'}</span>
      <span>📅 ${dateDisplay}</span>
    </div>
    ${article.cover ? `<div class="article-cover-img" style="background-image:url('${article.cover}')"></div>` : ''}
  </header>

  <article class="article-content">
${markdownToHtml(article.body || '')}

    <div class="article-cta">
      <h3>Cần tư vấn thêm?</h3>
      <p>Đội ngũ 2D Aquatic sẵn sàng hỗ trợ bạn 24/7</p>
      <a href="tel:0975112334">Gọi 0975.112.334</a>
    </div>
  </article>
</main>

<footer>
  <div class="foot-grid">
    <div class="foot-brand">
      <a href="/" class="logo" aria-label="2D Aquatic">
        <img class="logo-light" src="/images/logo-light.png" alt="2D Aquatic" width="184" height="80">
        <img class="logo-dark" src="/images/logo-dark.png" alt="2D Aquatic" width="184" height="80">
      </a>
      <p>Hệ sinh thái bể cá biển cao cấp tại Hà Nội.</p>
    </div>
    <div class="foot-col">
      <h4>Liên hệ</h4>
      <ul>
        <li><a href="tel:0975112334">0975.112.334</a></li>
        <li class="foot-address">305 Nguyễn Văn Cừ,<br>Bồ Đề, Hà Nội</li>
      </ul>
    </div>
  </div>
</footer>
</body>
</html>`;
}

// ===== BUILD PRODUCTS =====

function buildProducts() {
  console.log('🛒 Building products...');
  const products = readContentDir('products');

  const index = products.map(p => ({
    slug: p.slug,
    title: p.title,
    short_description: p.short_description,
    image: p.image,
    price: p.price,
    sale_price: p.sale_price,
    category: p.category,
    in_stock: p.in_stock,
    featured: p.featured
  }));

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'products-index.json'),
    JSON.stringify(index, null, 2)
  );
  console.log(`  ✓ Generated products-index.json (${index.length} products)`);

  return products;
}

// ===== BUILD CATEGORIES =====

function buildCategories() {
  console.log('📁 Building categories...');
  const categories = readContentDir('categories');
  fs.writeFileSync(
    path.join(CONTENT_DIR, 'categories-index.json'),
    JSON.stringify(categories, null, 2)
  );
  console.log(`  ✓ Generated categories-index.json (${categories.length} categories)`);
  return categories;
}

// ===== BUILD FAQS =====

function buildFaqs() {
  console.log('❓ Building FAQs...');
  const faqs = readContentDir('faqs')
    .filter(f => f.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'faqs-index.json'),
    JSON.stringify(faqs, null, 2)
  );
  console.log(`  ✓ Generated faqs-index.json (${faqs.length} FAQs)`);
  return faqs;
}

// ===== UPDATE SITEMAP =====

function updateSitemap(articles, products) {
  console.log('🗺️  Updating sitemap...');

  const today = new Date().toISOString();
  const baseUrls = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/be-ca', changefreq: 'weekly', priority: '0.9' },
    { url: '/san-pham', changefreq: 'weekly', priority: '0.9' },
    { url: '/dich-vu', changefreq: 'monthly', priority: '0.8' },
    { url: '/ho-tro', changefreq: 'monthly', priority: '0.7' },
    { url: '/lien-he', changefreq: 'monthly', priority: '0.8' },
    { url: '/blog', changefreq: 'weekly', priority: '0.8' },
  ];

  const articleUrls = articles
    .filter(a => a.published !== false)
    .map(a => ({
      url: `/blog/${a.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: a.date || today
    }));

  const allUrls = [...baseUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls.map(u => `  <url>
    <loc>https://2daquatic.com${u.url}</loc>
    <xhtml:link rel="alternate" hreflang="vi-VN" href="https://2daquatic.com${u.url}"/>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
  console.log(`  ✓ Updated sitemap.xml (${allUrls.length} URLs)`);
}

// ===== MAIN =====

console.log('═══════════════════════════════════════');
console.log('  🚀 2D Aquatic Content Build');
console.log('═══════════════════════════════════════\n');

try {
  buildCategories();
  const products = buildProducts();
  const articles = buildArticles();
  buildFaqs();
  updateSitemap(articles, products);

  console.log('\n✅ Build completed successfully!');
} catch (err) {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
}
