#!/usr/bin/env node
/**
 * Build Script for 2D Aquatic - Outputs to dist/
 *
 * Copy tất cả files cần thiết vào folder dist/
 * Generate JSON indexes và HTML pages
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const CONTENT_DIR = path.join(ROOT, 'content');

// Helpers
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

// ===== CLEAN dist/ =====
console.log('🧹 Cleaning dist/...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
ensureDir(DIST);

// ===== COPY ROOT FILES (HTML, images, css, etc.) =====
console.log('📂 Copying files to dist/...');

const ROOT_FILES_TO_COPY = [
  'index.html', '404.html',
  'apple-touch-icon.png', 'favicon-16.png', 'favicon-32.png',
  'favicon.ico', 'icon-192.png', 'icon-512.png',
  'site.webmanifest', 'robots.txt', 'sitemap.xml',
  '_headers'
];

ROOT_FILES_TO_COPY.forEach(file => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    copyFile(src, path.join(DIST, file));
    console.log(`  ✓ ${file}`);
  }
});

// Copy folders
const FOLDERS_TO_COPY = [
  'admin', 'be-ca', 'san-pham', 'dich-vu', 'ho-tro', 'lien-he',
  'blog', 'cam-on', 'css', 'images', 'content'
];

FOLDERS_TO_COPY.forEach(folder => {
  const src = path.join(ROOT, folder);
  if (fs.existsSync(src)) {
    copyDir(src, path.join(DIST, folder));
    console.log(`  ✓ ${folder}/`);
  }
});

// ===== CREATE _redirects in dist/ =====
console.log('📝 Creating _redirects in dist/...');
const redirectsContent = `# Cloudflare Pages redirects
/he-thong-lam-mat-be-ca  /san-pham  301
/xay-dung-be-ca          /be-ca     301
/thuc-an-ca-san-ho       /san-pham  301
/my-account/*            /lien-he   301
/wishlist                /lien-he   301
/cart                    /lien-he   301
/checkout                /lien-he   301
/shop                    /san-pham  301
/product/*               /san-pham  301
/category/*              /san-pham  301
/be_ca                   /be-ca     301
/san_pham                /san-pham  301
/dich_vu                 /dich-vu   301
/contact                 /lien-he   301
/faq                     /ho-tro    301
`;

fs.writeFileSync(path.join(DIST, '_redirects'), redirectsContent);
console.log('  ✓ _redirects');

console.log('');
console.log('✅ Build complete! Output in dist/');
console.log(`   Files in dist/: ${fs.readdirSync(DIST).length}`);
