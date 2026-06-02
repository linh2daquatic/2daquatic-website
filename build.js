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
      '<script type="application/ld+json">' + JSON.stringify(schema) + '</scr' + 'ipt>\n' +
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


console.log('');
console.log('✅ Build complete! Output in dist/');
console.log(`   Files in dist/: ${fs.readdirSync(DIST).length}`);
