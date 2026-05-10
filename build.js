#!/usr/bin/env node
/**
 * Build Script for 2D Aquatic - Outputs to dist/
 * NO _redirects file (use Cloudflare Bulk Redirects instead if needed)
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
  '_headers'
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
  'blog', 'cam-on', 'css', 'images', 'content'
];

FOLDERS.forEach(folder => {
  const src = path.join(ROOT, folder);
  if (fs.existsSync(src)) {
    copyDir(src, path.join(DIST, folder));
    console.log(`  ✓ ${folder}/`);
  }
});

console.log('');
console.log('✅ Build complete! Output in dist/');
console.log(`   Files in dist/: ${fs.readdirSync(DIST).length}`);
console.log('   NOTE: No _redirects file - Cloudflare will serve index.html for root');
