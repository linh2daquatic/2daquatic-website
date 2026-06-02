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


console.log('');
console.log('✅ Build complete! Output in dist/');
console.log(`   Files in dist/: ${fs.readdirSync(DIST).length}`);
