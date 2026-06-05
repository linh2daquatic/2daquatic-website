#!/usr/bin/env node
/**
 * Build Script for 2D Aquatic - Outputs to dist/
 * Copies all static files including _headers and _redirects for Netlify
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🧹 Cleaning dist/...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
ensureDir(DIST);

console.log('📂 Copying files to dist/...');

const ROOT_FILES = [
  'index.html', '404.html',
  'apple-touch-icon.png', 'favicon-16.png', 'favicon-32.png',
  'favicon.ico', 'icon-192.png', 'icon-512.png',
  'site.webmanifest', 'robots.txt', 'sitemap.xml',
  '_headers', '_redirects'
];

ROOT_FILES.forEach(file => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    copyFile(src, path.join(DIST, file));
    console.log(`  ✓ ${file}`);
  }
});

const FOLDERS = [
  'admin', 'be-ca', 'san-pham', 'dich-vu', 'ho-tro', 'lien-he',
  'blog', 'cam-on', 'css', 'images', 'content', 'functions'
];

FOLDERS.forEach(folder => {
  const src = path.join(ROOT, folder);
  if (fs.existsSync(src)) {
    copyDir(src, path.join(DIST, folder));
    console.log(`  ✓ ${folder}/`);
  }
});


// ===== AUTO-GENERATE products.json FROM CMS (content/products) =====
// Toan bo bao trong try/catch: neu loi, build VAN chay binh thuong (chi thieu san pham).
try {
  function stripQuotes(v) {
    v = (v || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }

  function parseProduct(raw) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return null;
    const lines = m[1].split(/\r?\n/);
    const body = (m[2] || '').trim();
    const data = { body: body };
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const mm = line.match(/^([a-zA-Z0-9_]+):(.*)$/);
      if (!mm) { i++; continue; }
      const key = mm[1];
      const rest = mm[2];
      if (rest.trim() === '') {
        // block (list hoac nested map) -> gom cac dong thut le
        const block = [];
        i++;
        while (i < lines.length && (/^\s+\S/.test(lines[i]) || lines[i].trim() === '')) {
          block.push(lines[i]); i++;
        }
        if (key === 'gallery') {
          data.gallery = block
            .filter(function (l) { return l.trim().indexOf('-') === 0; })
            .map(function (l) {
              const im = l.match(/image:\s*(.*)$/);
              return im ? stripQuotes(im[1]) : stripQuotes(l.replace(/^\s*-\s*/, ''));
            })
            .filter(Boolean);
        } else if (key === 'specs') {
          const specs = [];
          let cur = null;
          block.forEach(function (l) {
            const t = l.trim();
            if (!t) return;
            if (t.indexOf('-') === 0) {
              if (cur) specs.push(cur);
              cur = {};
              const km = t.replace(/^-\s*/, '').match(/^(\w+):\s*(.*)$/);
              if (km) cur[km[1]] = stripQuotes(km[2]);
            } else {
              const km = t.match(/^(\w+):\s*(.*)$/);
              if (km && cur) cur[km[1]] = stripQuotes(km[2]);
            }
          });
          if (cur) specs.push(cur);
          data.specs = specs;
        }
        // cac block khac (vd: seo) -> bo qua
        continue;
      }
      data[key] = stripQuotes(rest);
      i++;
    }
    // ep kieu
    if (data.price !== undefined) data.price = parseInt(String(data.price).replace(/[^\d]/g, ''), 10) || 0;
    data.sale_price = (data.sale_price !== undefined && String(data.sale_price).trim() !== '')
      ? (parseInt(String(data.sale_price).replace(/[^\d]/g, ''), 10) || null) : null;
    data.in_stock = String(data.in_stock).trim() !== 'false';
    data.featured = String(data.featured).trim() === 'true';
    return data;
  }

  const PRODUCTS_DIR = path.join(ROOT, 'content', 'products');
  const products = [];
  if (fs.existsSync(PRODUCTS_DIR)) {
    fs.readdirSync(PRODUCTS_DIR)
      .filter(function (f) { return f.endsWith('.md'); })
      .forEach(function (f) {
        try {
          const raw = fs.readFileSync(path.join(PRODUCTS_DIR, f), 'utf8');
          const p = parseProduct(raw);
          if (p && p.title) { products.push(p); }
        } catch (e) { console.warn('  (bo qua san pham loi: ' + f + ')'); }
      });
  }
  products.sort(function (a, b) {
    return ((b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      || String(b.date || '').localeCompare(String(a.date || ''));
  });
  fs.writeFileSync(path.join(DIST, 'products.json'), JSON.stringify(products, null, 2), 'utf8');
  console.log('  \u2713 products.json (' + products.length + ' san pham)');
} catch (e) {
  console.warn('  (Bo qua tao products.json: ' + e.message + ')');
  try { fs.writeFileSync(path.join(DIST, 'products.json'), '[]', 'utf8'); } catch (_) {}
}



// ===== AUTO-GENERATE BLOG from CMS (content/articles) =====
// Tao articles-index.json cho trang /blog/ va sinh trang HTML chi tiet cho moi bai.
// Toan bo bao trong try/catch: loi -> build van chay, chi thieu bai blog.
try {
  var ARTICLE_CSS = ".article-hero {\n  padding: 60px 24px 40px;\n  text-align: center;\n  background: linear-gradient(135deg, #f5f3ec 0%, #fafaf7 100%);\n}\n.article-hero .breadcrumb {\n  font-size: 13px;\n  color: var(--muted);\n  margin-bottom: 16px;\n}\n.article-hero .breadcrumb a { color: var(--muted); text-decoration: none; }\n.article-hero .breadcrumb a:hover { color: var(--reef); }\n.article-hero h1 {\n  font-family: var(--display);\n  font-size: clamp(28px, 5vw, 48px);\n  font-weight: 600;\n  margin-bottom: 16px;\n  max-width: 800px;\n  margin-left: auto;\n  margin-right: auto;\n  line-height: 1.2;\n}\n.article-hero .lead {\n  font-size: 18px;\n  color: var(--muted);\n  max-width: 700px;\n  margin: 0 auto 24px;\n  line-height: 1.6;\n}\n.article-meta-bar {\n  display: flex;\n  justify-content: center;\n  gap: 16px;\n  font-size: 14px;\n  color: var(--muted);\n  margin-bottom: 32px;\n  flex-wrap: wrap;\n}\n.article-content {\n  max-width: 760px;\n  margin: 0 auto;\n  padding: 60px 24px;\n  font-size: 17px;\n  line-height: 1.8;\n  color: #2a3340;\n}\n.article-content > p:first-of-type::first-letter {\n  font-family: var(--display);\n  font-size: 64px;\n  font-weight: 600;\n  float: left;\n  line-height: 1;\n  padding: 4px 12px 0 0;\n  color: var(--reef);\n}\n.article-content h2 {\n  font-family: var(--display);\n  font-size: 32px;\n  font-weight: 600;\n  margin: 56px 0 20px;\n  color: var(--ink);\n  scroll-margin-top: 80px;\n}\n.article-content h3 {\n  font-family: var(--display);\n  font-size: 22px;\n  font-weight: 600;\n  margin: 36px 0 14px;\n  color: var(--ink);\n}\n.article-content p { margin-bottom: 22px; }\n.article-content ul, .article-content ol {\n  margin: 0 0 22px 0;\n  padding-left: 28px;\n}\n.article-content li { margin-bottom: 10px; }\n.article-content strong { color: var(--ink); font-weight: 600; }\n.article-content em { color: var(--reef); font-style: italic; }\n.article-content a { color: var(--reef); font-weight: 500; }\n.article-content blockquote {\n  border-left: 4px solid var(--reef);\n  padding: 16px 0 16px 24px;\n  margin: 28px 0;\n  font-style: italic;\n  color: #475467;\n  background: #f8fafb;\n  border-radius: 0 8px 8px 0;\n}\n.callout-box {\n  background: linear-gradient(135deg, #eafffa 0%, #f0fffd 100%);\n  border-left: 4px solid var(--reef);\n  padding: 20px 24px;\n  border-radius: 8px;\n  margin: 28px 0;\n}\n.callout-box.warning {\n  background: linear-gradient(135deg, #fff8ec 0%, #fffbf3 100%);\n  border-left-color: #f0a020;\n}\n.callout-box.danger {\n  background: linear-gradient(135deg, #fff0f0 0%, #fff5f5 100%);\n  border-left-color: #e53e3e;\n}\n.callout-box strong { display: block; margin-bottom: 8px; font-size: 15px; }\n\n.price-table {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 24px 0;\n  font-size: 15px;\n  background: white;\n  border-radius: 10px;\n  overflow: hidden;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.08);\n}\n.price-table th {\n  background: var(--ink);\n  color: white;\n  padding: 14px 12px;\n  text-align: left;\n  font-weight: 600;\n}\n.price-table td {\n  padding: 12px;\n  border-bottom: 1px solid #e5e7eb;\n}\n.price-table tr:last-child td { border-bottom: none; }\n.price-table tr.total td {\n  background: #f5f3ec;\n  font-weight: 600;\n  color: var(--ink);\n}\n\n.toc {\n  background: #f8fafb;\n  border: 1px solid #e5e7eb;\n  border-radius: 10px;\n  padding: 20px 24px;\n  margin: 24px 0 40px;\n}\n.toc-title {\n  font-family: var(--display);\n  font-weight: 600;\n  font-size: 18px;\n  margin-bottom: 12px;\n  color: var(--ink);\n}\n.toc ol { margin: 0; padding-left: 20px; }\n.toc li { margin-bottom: 6px; font-size: 15px; }\n.toc a { color: #475467; text-decoration: none; }\n.toc a:hover { color: var(--reef); }\n\n.cta-inline {\n  background: linear-gradient(135deg, #0a1628 0%, #1a2940 100%);\n  color: white;\n  padding: 32px 28px;\n  border-radius: 14px;\n  margin: 36px 0;\n  text-align: center;\n}\n.cta-inline h3 {\n  color: white !important;\n  margin-top: 0 !important;\n  margin-bottom: 8px !important;\n}\n.cta-inline p {\n  color: rgba(255,255,255,0.85);\n  margin-bottom: 20px;\n}\n.cta-inline .btn-row {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n  flex-wrap: wrap;\n}\n.cta-inline a {\n  display: inline-block;\n  padding: 12px 24px;\n  border-radius: 999px;\n  font-weight: 600;\n  text-decoration: none;\n  font-size: 15px;\n}\n.cta-inline .btn-primary {\n  background: var(--reef);\n  color: white !important;\n}\n.cta-inline .btn-secondary {\n  background: rgba(255,255,255,0.15);\n  color: white !important;\n  border: 1px solid rgba(255,255,255,0.3);\n}\n\n.related-posts {\n  max-width: 1100px;\n  margin: 0 auto;\n  padding: 40px 24px 80px;\n}\n.related-posts h2 {\n  font-family: var(--display);\n  font-size: 28px;\n  font-weight: 600;\n  margin-bottom: 24px;\n  text-align: center;\n}\n.related-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n  gap: 20px;\n}\n.related-card {\n  padding: 24px;\n  background: #f8fafb;\n  border-radius: 12px;\n  text-decoration: none;\n  color: inherit;\n  border: 1px solid #e5e7eb;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.related-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(0,0,0,0.08);\n}\n.related-card .tag {\n  font-size: 12px;\n  color: var(--reef);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n}\n.related-card h3 {\n  font-family: var(--display);\n  font-size: 18px;\n  font-weight: 600;\n  margin-bottom: 8px;\n  line-height: 1.3;\n}\n.related-card p {\n  font-size: 14px;\n  color: var(--muted);\n  margin: 0;\n  line-height: 1.5;\n}\n\n@media (max-width: 640px) {\n  .article-content { padding: 40px 20px; font-size: 16px; }\n  .article-content h2 { font-size: 26px; margin: 40px 0 16px; }\n  .article-content h3 { font-size: 19px; }\n}\n";
  function bStripQuotes(v) {
    v = (v || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    return v;
  }
  function bEscapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function bEscapeAttr(s) { return bEscapeHtml(s); }

  // ---- Mini Markdown -> HTML (du dung cho CMS: heading, bold, italic, link, img, list, quote, hr, code) ----
  function mdToHtml(md) {
    if (!md) return '';
    md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var lines = md.split('\n');
    var out = [];
    var i = 0;
    function inline(t) {
      // escape first, then apply inline md (so user text is safe)
      t = bEscapeHtml(t);
      // images ![alt](src)
      t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" style="max-width:100%;border-radius:10px;margin:12px 0">');
      // links [text](href)
      t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
      // bold **x**
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // italic *x*
      t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
      // inline code `x`
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      return t;
    }
    while (i < lines.length) {
      var line = lines[i];
      var t = line.trim();
      if (t === '') { i++; continue; }
      // hr
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { out.push('<hr>'); i++; continue; }
      // heading ###### .. #
      var hm = t.match(/^(#{1,6})\s+(.*)$/);
      if (hm) { var lv = hm[1].length; out.push('<h' + lv + '>' + inline(hm[2]) + '</h' + lv + '>'); i++; continue; }
      // blockquote
      if (/^>\s?/.test(t)) {
        var bq = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) { bq.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + inline(bq.join(' ')) + '</blockquote>');
        continue;
      }
      // unordered list
      if (/^[-*+]\s+/.test(t)) {
        var ul = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) { ul.push('<li>' + inline(lines[i].trim().replace(/^[-*+]\s+/, '')) + '</li>'); i++; }
        out.push('<ul>' + ul.join('') + '</ul>');
        continue;
      }
      // ordered list
      if (/^\d+\.\s+/.test(t)) {
        var ol = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { ol.push('<li>' + inline(lines[i].trim().replace(/^\d+\.\s+/, '')) + '</li>'); i++; }
        out.push('<ol>' + ol.join('') + '</ol>');
        continue;
      }
      // paragraph (gather consecutive non-empty, non-special lines)
      var para = [];
      while (i < lines.length) {
        var pt = lines[i].trim();
        if (pt === '' || /^(#{1,6})\s/.test(pt) || /^[-*+]\s/.test(pt) || /^\d+\.\s/.test(pt) || /^>\s?/.test(pt) || /^(-{3,}|\*{3,}|_{3,})$/.test(pt)) break;
        para.push(pt); i++;
      }
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
    return out.join('\n');
  }

  function parseArticle(raw) {
    var m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return null;
    var fmLines = m[1].split(/\r?\n/);
    var body = (m[2] || '').trim();
    var data = { body: body };
    var i = 0;
    while (i < fmLines.length) {
      var line = fmLines[i];
      var mm = line.match(/^([a-zA-Z0-9_]+):(.*)$/);
      if (!mm) { i++; continue; }
      var key = mm[1], rest = mm[2];
      if (rest.trim() === '') {
        // block: collect indented lines (tags list etc.)
        var block = []; i++;
        while (i < fmLines.length && (/^\s+\S/.test(fmLines[i]) || fmLines[i].trim() === '')) { block.push(fmLines[i]); i++; }
        if (key === 'tags') {
          data.tags = block.filter(function (l) { return l.trim().indexOf('-') === 0; })
            .map(function (l) { return bStripQuotes(l.trim().replace(/^-\s*/, '')); }).filter(Boolean);
        }
        continue;
      }
      data[key] = bStripQuotes(rest);
      i++;
    }
    data.published = String(data.published).trim() !== 'false';
    data.featured = String(data.featured).trim() === 'true';
    return data;
  }

  function articlePage(a) {
    var url = 'https://2daquatic.com/blog/' + a.slug + '/';
    var title = a.title || 'Bài viết';
    var desc = (a.excerpt || a.title || '').replace(/\s+/g, ' ').trim();
    var cover = a.cover || '/images/og-image.jpg';
    var coverAbs = cover.indexOf('http') === 0 ? cover : ('https://2daquatic.com' + cover);
    var catLabel = { 'huong-dan': 'Hướng dẫn nuôi cá', 'setup': 'Kinh nghiệm setup', 'bao-tri': 'Bảo trì bể cá', 'san-pham-moi': 'Sản phẩm mới' }[a.category] || 'Bài viết';
    var dateISO = a.date ? new Date(a.date).toISOString() : new Date().toISOString();
    var dateVN = a.date ? new Date(a.date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    var words = (a.body || '').split(/\s+/).length;
    var readMin = Math.max(2, Math.round(words / 200));
    var bodyHtml = mdToHtml(a.body);
    var schema = {
      "@context": "https://schema.org", "@type": "Article",
      "headline": title, "description": desc, "image": coverAbs,
      "datePublished": dateISO, "dateModified": dateISO,
      "author": { "@type": "Organization", "name": a.author || "2D Aquatic" },
      "publisher": { "@type": "Organization", "name": "2D Aquatic", "logo": { "@type": "ImageObject", "url": "https://2daquatic.com/images/logo-light.png" } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": url }
    };
    return '<!DOCTYPE html>\n<html lang="vi">\n<head>\n' +
      '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="theme-color" content="#0a1628">\n' +
      '<title>' + bEscapeHtml(title) + ' | 2D Aquatic</title>\n' +
      '<meta name="description" content="' + bEscapeAttr(desc) + '">\n' +
      '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">\n' +
      '<meta name="author" content="' + bEscapeAttr(a.author || '2D Aquatic') + '">\n' +
      '<meta name="geo.region" content="VN-HN">\n<meta name="geo.placename" content="Hà Nội">\n' +
      '<link rel="canonical" href="' + url + '">\n' +
      '<meta property="og:type" content="article">\n<meta property="og:url" content="' + url + '">\n' +
      '<meta property="og:title" content="' + bEscapeAttr(title) + '">\n' +
      '<meta property="og:description" content="' + bEscapeAttr(desc) + '">\n' +
      '<meta property="og:image" content="' + bEscapeAttr(coverAbs) + '">\n' +
      '<meta property="og:locale" content="vi_VN">\n<meta property="og:site_name" content="2D Aquatic">\n' +
      '<meta property="article:published_time" content="' + dateISO + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="twitter:title" content="' + bEscapeAttr(title) + '">\n' +
      '<meta name="twitter:description" content="' + bEscapeAttr(desc) + '">\n' +
      '<meta name="twitter:image" content="' + bEscapeAttr(coverAbs) + '">\n' +
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
      '<link rel="stylesheet" href="/css/main.v2.css">\n' +
      '<style>' + ARTICLE_CSS + '</style>\n' +
      '<script type="application/ld+json">' + JSON.stringify(schema) + '</scr' + 'ipt>\n' +
      '<script type="application/ld+json">' + JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Trang ch\u1ee7","item":"https://2daquatic.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://2daquatic.com/blog/"},{"@type":"ListItem","position":3,"name":title,"item":url}]}) + '</scr' + 'ipt>\n' +
      '</head>\n<body>\n' +
      '<header class="nav-wrap" style="position:sticky;top:0;background:rgba(10,22,40,0.95);backdrop-filter:blur(10px);z-index:100">\n' +
      '  <nav style="max-width:1400px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between">\n' +
      '    <a href="/" style="display:flex;align-items:center;text-decoration:none"><img src="/images/logo-light.png" alt="2D Aquatic" width="120" height="52" style="height:42px;width:auto"></a>\n' +
      '    <div style="display:flex;gap:24px;align-items:center">\n' +
      '      <a href="/be-ca/" style="color:white;text-decoration:none;font-size:14px;font-weight:500">Bể cá</a>\n' +
      '      <a href="/san-pham/" style="color:white;text-decoration:none;font-size:14px;font-weight:500">Sản phẩm</a>\n' +
      '      <a href="/blog/" style="color:#00d4b8;text-decoration:none;font-size:14px;font-weight:600">Blog</a>\n' +
      '      <a href="/lien-he/" style="background:#00d4b8;color:white;padding:8px 18px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Liên hệ</a>\n' +
      '    </div>\n  </nav>\n</header>\n' +
      '<section class="article-hero">\n' +
      '  <div class="breadcrumb"><a href="/">Trang chủ</a> / <a href="/blog/">Blog</a> / <span>' + bEscapeHtml(title) + '</span></div>\n' +
      '  <h1>' + bEscapeHtml(title) + '</h1>\n' +
      (desc ? '  <p class="lead">' + bEscapeHtml(desc) + '</p>\n' : '') +
      '  <div class="article-meta-bar">' +
      (dateVN ? '<span>📅 ' + dateVN + '</span><span>·</span>' : '') +
      '<span>👤 ' + bEscapeHtml(a.author || 'Đội ngũ 2D Aquatic') + '</span><span>·</span>' +
      '<span>⏱️ ' + readMin + ' phút đọc</span><span>·</span><span>🏷️ ' + bEscapeHtml(catLabel) + '</span></div>\n' +
      '</section>\n' +
      '<article class="article-content">\n' +
      (a.cover ? '<img src="' + bEscapeAttr(a.cover) + '" alt="' + bEscapeAttr(title) + '" style="width:100%;border-radius:14px;margin-bottom:24px" loading="lazy">\n' : '') +
      bodyHtml + '\n' +
      '<div style="margin-top:40px;padding:24px;background:rgba(0,212,184,0.08);border-radius:14px;text-align:center">\n' +
      '  <p style="margin-bottom:14px;font-weight:600">Cần tư vấn setup bể cá biển? Liên hệ 2D Aquatic ngay.</p>\n' +
      '  <a href="https://zalo.me/0975112334" target="_blank" rel="noopener" style="display:inline-block;background:#00d4b8;color:white;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:600;margin:4px">Nhắn Zalo</a>\n' +
      '  <a href="/san-pham/" style="display:inline-block;border:1px solid #0a1628;color:#0a1628;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:600;margin:4px">Xem sản phẩm</a>\n' +
      '</div>\n' +
      '</article>\n' +
      '<footer style="background:#0a1628;color:white;padding:48px 24px;text-align:center;margin-top:40px">\n' +
      '  <img src="/images/logo-light.png" alt="2D Aquatic" width="120" style="margin-bottom:16px;height:auto">\n' +
      '  <p style="color:rgba(255,255,255,0.7);margin-bottom:8px">Bể cá biển cao cấp tại Hà Nội</p>\n' +
      '  <p style="color:rgba(255,255,255,0.5);font-size:14px">305 Nguyễn Văn Cừ, Bồ Đề, Long Biên · Hotline: <a href="tel:0975112334" style="color:#00d4b8">0975.112.334</a></p>\n' +
      '</footer>\n</body>\n</html>\n';
  }

  var ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
  var articles = [];
  if (fs.existsSync(ARTICLES_DIR)) {
    fs.readdirSync(ARTICLES_DIR).filter(function (f) { return f.endsWith('.md'); }).forEach(function (f) {
      try {
        var raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
        var a = parseArticle(raw);
        if (a && a.title && a.slug) articles.push(a);
      } catch (e) { console.warn('  (bo qua bai loi: ' + f + ')'); }
    });
  }
  // index.json for /blog/ listing (metadata only)
  var index = articles.filter(function (a) { return a.published !== false; }).map(function (a) {
    return { slug: a.slug, title: a.title, date: a.date, category: a.category, cover: a.cover, excerpt: a.excerpt, author: a.author, published: a.published, featured: a.featured };
  });
  fs.writeFileSync(path.join(DIST, 'content', 'articles-index.json'), JSON.stringify(index, null, 2), 'utf8');
  // per-post detail pages -> dist/blog/<slug>/index.html
  var made = 0;
  articles.filter(function (a) { return a.published !== false; }).forEach(function (a) {
    try {
      var dir = path.join(DIST, 'blog', a.slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), articlePage(a), 'utf8');
      made++;
    } catch (e) { console.warn('  (loi sinh trang bai: ' + a.slug + ')'); }
  });
  console.log('  \u2713 blog: ' + index.length + ' bai (articles-index.json + ' + made + ' trang chi tiet)');
} catch (e) {
  console.warn('  (Bo qua tao blog: ' + e.message + ')');
  try { fs.writeFileSync(path.join(DIST, 'content', 'articles-index.json'), '[]', 'utf8'); } catch (_) {}
}


// ===== AUTO-GENERATE PRODUCT DETAIL PAGES (/san-pham/<slug>/) =====
try {
  function escH(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function vndFmt(n){ return n ? Number(n).toLocaleString('vi-VN')+'đ' : 'Liên hệ'; }

  function productPage(p) {
    var url = 'https://2daquatic.com/san-pham/' + p.slug + '/';
    var title = p.title || 'Sản phẩm';
    var desc = (p.short_description || p.body || title).replace(/\s+/g,' ').trim().slice(0,160);
    var img = p.image || '/images/og-image.jpg';
    var imgAbs = img.indexOf('http')===0 ? img : ('https://2daquatic.com'+img);
    var priceNum = p.price || 0;
    var salePriceNum = p.sale_price;
    var priceDisplay = salePriceNum ? vndFmt(salePriceNum) : vndFmt(priceNum);
    var priceOld = salePriceNum ? ('<span style="text-decoration:line-through;opacity:.5;font-size:18px;margin-left:8px">'+vndFmt(priceNum)+'</span>') : '';
    var specsHtml = (p.specs && p.specs.length) ?
      '<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:15px">' +
      p.specs.map(function(s){
        return '<tr><td style="padding:9px 12px;border-bottom:1px solid rgba(0,0,0,.08);color:#666;width:44%">'+escH(s.key)+'</td>'+
               '<td style="padding:9px 12px;border-bottom:1px solid rgba(0,0,0,.08);font-weight:600">'+escH(s.value)+'</td></tr>';
      }).join('') + '</table>' : '';
    var warrantyHtml = p.warranty ? '<p style="font-size:14px;color:#16a085;margin:8px 0">🛡️ Bảo hành: '+escH(p.warranty)+'</p>' : '';
    var stockHtml = p.in_stock ?
      '<span style="color:#16a085;font-weight:600;font-size:14px">✅ Còn hàng</span>' :
      '<span style="color:#e55;font-weight:600;font-size:14px">⏳ Tạm hết hàng</span>';
    // body markdown lite
    var bodyHtml = (p.body||p.short_description||'').split('\n').map(function(ln){
      var t=ln.trim();
      if(!t) return '';
      var m=t.match(/^(#{1,3})\s+(.*)/);
      if(m){var lv=m[1].length+1;return '<h'+lv+' style="color:#0a1628;margin:20px 0 8px">'+escH(m[2])+'</h'+lv+'>';}
      t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>');
      if(t.match(/^[-*]\s/)){return '<li style="margin:4px 0">'+t.replace(/^[-*]\s/,'')+'</li>';}
      return '<p style="margin:10px 0;line-height:1.7;color:#2a3340">'+t+'</p>';
    }).join('');
    // Product schema
    var schema = JSON.stringify({
      "@context":"https://schema.org","@type":"Product",
      "name":title,"description":desc,"image":imgAbs,"url":url,
      "brand":{"@type":"Brand","name":"2D Aquatic"},
      "offers":{"@type":"Offer","price":salePriceNum||priceNum||0,
        "priceCurrency":"VND","availability":p.in_stock?"https://schema.org/InStock":"https://schema.org/OutOfStock",
        "url":url,"seller":{"@type":"Organization","name":"2D Aquatic"}}
    });
    var breadcrumb = JSON.stringify({
      "@context":"https://schema.org","@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Trang chủ","item":"https://2daquatic.com/"},
        {"@type":"ListItem","position":2,"name":"Sản phẩm","item":"https://2daquatic.com/san-pham/"},
        {"@type":"ListItem","position":3,"name":title,"item":url}
      ]
    });
    return '<!DOCTYPE html>\n<html lang="vi">\n<head>\n'+
      '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0a1628">\n'+
      '<title>'+escH(title)+' | 2D Aquatic</title>\n'+
      '<meta name="description" content="'+escH(desc)+'">\n'+
      '<link rel="canonical" href="'+url+'">\n'+
      '<meta property="og:type" content="product"><meta property="og:url" content="'+url+'">\n'+
      '<meta property="og:title" content="'+escH(title)+'">\n'+
      '<meta property="og:description" content="'+escH(desc)+'">\n'+
      '<meta property="og:image" content="'+escH(imgAbs)+'">\n'+
      '<meta property="og:locale" content="vi_VN"><meta property="og:site_name" content="2D Aquatic">\n'+
      '<script type="application/ld+json">'+schema+'</scr'+'ipt>\n'+
      '<script type="application/ld+json">'+breadcrumb+'</scr'+'ipt>\n'+
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">\n'+
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'+
      '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n'+
      '<link rel="stylesheet" href="/css/main.v2.css">\n'+
      '<style>*{box-sizing:border-box}body{font-family:Inter,sans-serif;margin:0;background:#fafaf7;color:#2a3340}'+
      '.sp-wrap{max-width:1100px;margin:0 auto;padding:48px 24px 80px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}'+
      '@media(max-width:700px){.sp-wrap{grid-template-columns:1fr;padding:24px 16px 60px}}'+
      '.sp-img{width:100%;border-radius:16px;background:#0e1e2c;aspect-ratio:4/3;object-fit:contain}'+
      '.sp-breadcrumb{font-size:13px;color:#888;margin-bottom:8px}.sp-breadcrumb a{color:#16a085;text-decoration:none}'+
      '.sp-cat{font-size:12px;font-weight:700;color:#16a085;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}'+
      '.sp-title{font-family:Fraunces,serif;font-size:clamp(22px,4vw,34px);font-weight:700;color:#0a1628;margin:0 0 12px;line-height:1.25}'+
      '.sp-price{font-size:30px;font-weight:700;color:#16a085;margin:12px 0}'+
      '.sp-stock-row{display:flex;align-items:center;gap:16px;margin:8px 0 20px}'+
      '.sp-cta{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}'+
      '.sp-btn{padding:13px 26px;border-radius:999px;font-weight:600;text-decoration:none;font-size:15px;display:inline-block}'+
      '.sp-btn-primary{background:#00d4b8;color:#fff}.sp-btn-ghost{border:2px solid #0a1628;color:#0a1628}'+
      '.sp-section{margin:28px 0}.sp-section h3{font-family:Fraunces,serif;font-size:18px;color:#0a1628;margin:0 0 10px}'+
      '.sp-back{display:inline-flex;align-items:center;gap:6px;color:#16a085;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:24px}'+
      '</style>\n'+
      '</head>\n<body>\n'+
      '<header class="nav-wrap" style="position:sticky;top:0;background:rgba(10,22,40,0.95);backdrop-filter:blur(10px);z-index:100">\n'+
      '  <nav style="max-width:1400px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between">\n'+
      '    <a href="/" style="display:flex;align-items:center;text-decoration:none"><img src="/images/logo-light.png" alt="2D Aquatic" width="120" height="52" style="height:42px;width:auto"></a>\n'+
      '    <div style="display:flex;gap:24px;align-items:center">\n'+
      '      <a href="/be-ca/" style="color:white;text-decoration:none;font-size:14px;font-weight:500">Bể cá</a>\n'+
      '      <a href="/san-pham/" style="color:#00d4b8;text-decoration:none;font-size:14px;font-weight:600">Sản phẩm</a>\n'+
      '      <a href="/blog/" style="color:white;text-decoration:none;font-size:14px;font-weight:500">Blog</a>\n'+
      '      <a href="/lien-he/" style="background:#00d4b8;color:white;padding:8px 18px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Liên hệ</a>\n'+
      '    </div>\n  </nav>\n</header>\n'+
      '<div style="max-width:1100px;margin:20px auto;padding:0 24px">\n'+
      '  <a href="/san-pham/" class="sp-back">← Tất cả sản phẩm</a>\n'+
      '  <div class="sp-breadcrumb"><a href="/">Trang chủ</a> / <a href="/san-pham/">Sản phẩm</a> / '+escH(title)+'</div>\n'+
      '</div>\n'+
      '<div class="sp-wrap">\n'+
      '  <div>\n'+
      (img && img !== '' ? '    <img class="sp-img" src="'+escH(img)+'" alt="'+escH(title)+'" loading="eager">\n' :
       '    <div class="sp-img" style="display:flex;align-items:center;justify-content:center;background:#0e1e2c"><span style="color:#16a085;font-size:48px">🪸</span></div>\n')+
      '  </div>\n'+
      '  <div>\n'+
      '    <div class="sp-cat">'+escH(p.category||'')+'</div>\n'+
      '    <h1 class="sp-title">'+escH(title)+'</h1>\n'+
      '    <div class="sp-price">'+priceDisplay+priceOld+'</div>\n'+
      '    <div class="sp-stock-row">'+stockHtml+(warrantyHtml)+'</div>\n'+
      '    <p style="font-size:15px;line-height:1.65;color:#444;margin:0 0 20px">'+escH(p.short_description||'')+'</p>\n'+
      '    <div class="sp-cta">\n'+
      '      <a class="sp-btn sp-btn-primary" href="https://zalo.me/0975112334" target="_blank" rel="noopener">📞 Nhắn Zalo tư vấn</a>\n'+
      '      <a class="sp-btn sp-btn-ghost" href="https://www.facebook.com/2DAquatic/" target="_blank" rel="noopener">Facebook</a>\n'+
      '    </div>\n'+
      (specsHtml ? '    <div class="sp-section"><h3>Thông số kỹ thuật</h3>'+specsHtml+'</div>\n' : '')+
      '  </div>\n'+
      '</div>\n'+
      (bodyHtml ? '<div style="max-width:760px;margin:0 auto;padding:0 24px 60px">'+bodyHtml+'</div>\n' : '')+
      '<footer style="background:#0a1628;color:white;padding:48px 24px;text-align:center;margin-top:40px">\n'+
      '  <img src="/images/logo-light.png" alt="2D Aquatic" width="120" style="margin-bottom:16px;height:auto">\n'+
      '  <p style="color:rgba(255,255,255,.7);margin-bottom:8px">Bể cá biển cao cấp tại Hà Nội</p>\n'+
      '  <p style="color:rgba(255,255,255,.5);font-size:14px">305 Nguyễn Văn Cừ, Bồ Đề, Long Biên · Hotline: <a href="tel:0975112334" style="color:#00d4b8">0975.112.334</a></p>\n'+
      '</footer>\n</body>\n</html>\n';
  }

  // Generate product detail pages & update sitemap
  var prodDir = path.join(DIST,'content','products-data');
  if(!fs.existsSync(prodDir)) prodDir=path.join(DIST,'content');
  var prodJsonPath=path.join(DIST,'products.json');
  if(fs.existsSync(prodJsonPath)){
    var allProds=JSON.parse(fs.readFileSync(prodJsonPath,'utf8'));
    var madeP=0;
    allProds.forEach(function(p){
      if(!p.slug) return;
      try{
        var dir=path.join(DIST,'san-pham',p.slug);
        fs.mkdirSync(dir,{recursive:true});
        fs.writeFileSync(path.join(dir,'index.html'),productPage(p),'utf8');
        madeP++;
      }catch(e){console.warn('  (loi trang san pham: '+p.slug+')');}
    });
    console.log('  \u2713 product pages: '+madeP+' trang (/san-pham/<slug>/)');
  }
} catch(e){ console.warn('  (product pages error: '+e.message+')'); }


// ===== AUTO-GENERATE SITEMAP.XML (bao gồm tất cả bài blog) =====
try {
  var SM_STATIC = [
    {u:'https://2daquatic.com/',           p:'1.0', c:'weekly'},
    {u:'https://2daquatic.com/be-ca/',     p:'0.9', c:'weekly'},
    {u:'https://2daquatic.com/san-pham/',  p:'0.9', c:'weekly'},
    {u:'https://2daquatic.com/dich-vu/',   p:'0.8', c:'monthly'},
    {u:'https://2daquatic.com/ho-tro/',    p:'0.7', c:'monthly'},
    {u:'https://2daquatic.com/lien-he/',   p:'0.8', c:'monthly'},
    {u:'https://2daquatic.com/blog/',      p:'0.8', c:'weekly'},
    {u:'https://2daquatic.com/blog/setup-be-ca-bien-200l-cho-nguoi-moi-tu-a-den-z/', p:'0.7', c:'monthly'},
  ];

  var smToday = new Date().toISOString().split('T')[0];
  var smEntries = SM_STATIC.map(function(s){
    return '  <url>\n    <loc>'+s.u+'</loc>\n    <changefreq>'+s.c+'</changefreq>\n    <priority>'+s.p+'</priority>\n    <lastmod>'+smToday+'</lastmod>\n  </url>';
  });
  // Add all published blog articles
  var smIdxPath = path.join(DIST,'content','articles-index.json');
  if(fs.existsSync(smIdxPath)){
    JSON.parse(fs.readFileSync(smIdxPath,'utf8')).filter(function(a){return a.published!==false;}).forEach(function(a){
      var lm = a.date ? new Date(a.date).toISOString().split('T')[0] : smToday;
      smEntries.push('  <url>\n    <loc>https://2daquatic.com/blog/'+a.slug+'/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n    <lastmod>'+lm+'</lastmod>\n  </url>');
    });
  }
  // add product pages to sitemap
  var pjSm=path.join(DIST,'products.json');
  if(fs.existsSync(pjSm)){JSON.parse(fs.readFileSync(pjSm,'utf8')).filter(function(pr){return pr.slug;}).forEach(function(pr){
    smEntries.push('  <url>\n    <loc>https://2daquatic.com/san-pham/'+pr.slug+'/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>');
  });}
  var smXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + smEntries.join('\n') + '\n</urlset>';
  fs.writeFileSync(path.join(DIST,'sitemap.xml'), smXml, 'utf8');
  console.log('  \u2713 sitemap.xml (' + smEntries.length + ' URLs)');
} catch(e) { console.warn('  (sitemap error: '+e.message+')'); }


console.log('');
console.log('✅ Build complete! Output in dist/');
console.log(`   Files in dist/: ${fs.readdirSync(DIST).length}`);
