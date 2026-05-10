# 2D Aquatic Website - Tài liệu nền tảng SEO

> **Tài liệu kỹ thuật toàn diện cho website 2daquatic.com**
> Phiên bản: 1.0 | Ngày: 09/05/2026
> Domain: https://2daquatic.com
> Hosting: Netlify (đề xuất)

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Tóm tắt các fix đã thực hiện](#3-tóm-tắt-các-fix-đã-thực-hiện)
4. [Chi tiết kỹ thuật từng file](#4-chi-tiết-kỹ-thuật-từng-file)
5. [Schema.org Structured Data](#5-schemaorg-structured-data)
6. [Hướng dẫn triển khai](#6-hướng-dẫn-triển-khai)
7. [Hướng dẫn bảo trì & cập nhật](#7-hướng-dẫn-bảo-trì--cập-nhật)
8. [Checklist kiểm tra trước launch](#8-checklist-kiểm-tra-trước-launch)
9. [SEO Tracking & KPIs](#9-seo-tracking--kpis)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. TỔNG QUAN

### 1.1 Thông tin doanh nghiệp

| Thông tin | Giá trị |
|---|---|
| Tên công ty | Công ty TNHH 2D Aquatic |
| Tên thương hiệu | 2D Aquatic |
| Website | https://2daquatic.com |
| Showroom | 305 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội |
| Hotline | 0975.112.334 / 0866.112.334 |
| Email | thelinhtts2@gmail.com |
| Giờ mở cửa | 8h - 21h, tất cả các ngày |
| Tọa độ | 21.0414, 105.8783 |
| Facebook | https://www.facebook.com/2DAquatic/ |
| Zalo | https://zalo.me/0975112334 |

### 1.2 Cấu trúc website

```
2daquatic.com/
├── /                    Trang chủ
├── /be-ca               Catalog 3 dòng bể (ProMax, Infinity, Custom)
├── /san-pham            Sản phẩm (lọc, đèn LED, hóa chất, sinh vật)
├── /dich-vu             Dịch vụ setup, bảo trì, tư vấn
├── /ho-tro              Hướng dẫn, FAQ, bảo hành
└── /lien-he             Showroom, contact info
```

### 1.3 Chính sách dịch vụ

- **Bảo hành bể**: 5 năm
- **Bảo hành sinh vật**: 7 ngày
- **Khảo sát**: Miễn phí tại Hà Nội
- **Setup**: Trọn gói, vận hành trong 24h
- **Bảo trì**: Định kỳ hàng tuần/tháng
- **Giao hàng**: Toàn quốc (thiết bị), nội thành Hà Nội (sinh vật sống)

### 1.4 Sản phẩm chính

#### Bể cá

| Dòng bể | Loại lọc | Dung tích | Giá khoảng | Đối tượng |
|---|---|---|---|---|
| **ProMax S Series** | Lọc vách tích hợp | 60-100L | 8-15 triệu | Người mới, không gian nhỏ |
| **Infinity S Series** | Lọc tràn dưới | 300L+ | 25-100+ triệu | Flagship, người chơi nâng cao |
| **Custom Design** | Tùy chọn | 100-2000L+ | Liên hệ | Yêu cầu đặc biệt |

#### Phụ kiện
- Lọc & Skimmer (68 sản phẩm)
- Đèn LED chuyên dụng (31 sản phẩm)
- Hóa chất Reef Balance (94 sản phẩm)
- Cá biển và san hô tươi sống (BH 7 ngày)

---

## 2. CẤU TRÚC THƯ MỤC

```
fixed-website/
├── index.html                 # Trang chủ (đã optimize)
├── 404.html                   # Trang lỗi 404 (noindex)
├── favicon.svg                # Favicon SVG (32x32)
├── robots.txt                 # Robots directives
├── sitemap.xml                # XML sitemap với hreflang
├── site.webmanifest           # PWA manifest
├── _redirects                 # Netlify redirects (301/404)
├── _headers                   # Netlify HTTP headers (security, cache)
│
├── be-ca/
│   └── index.html             # Trang bể cá (Product schema)
├── san-pham/
│   └── index.html             # Trang sản phẩm
├── dich-vu/
│   └── index.html             # Trang dịch vụ (Service schema)
├── ho-tro/
│   └── index.html             # Trang hỗ trợ (FAQPage schema)
├── lien-he/
│   └── index.html             # Trang liên hệ (ContactPage schema)
│
├── css/
│   ├── main.css               # CSS chung cho 5 trang con
│   ├── home.css               # CSS riêng cho trang chủ
│   └── seo-additions.css      # CSS cho a11y (skip-link, sr-only)
│
└── images/
    ├── slide1-desktop.jpg     # Hero image desktop (1361x560)
    ├── slide1-mobile.jpg      # Hero image mobile (896x1195)
    ├── slide2-desktop.jpg     # Slide 2 desktop (1376x768)
    ├── slide2-mobile.jpg      # Slide 2 mobile (768x1376)
    ├── logo-light.svg         # Logo cho nền tối (header)
    └── logo-dark.svg          # Logo cho nền sáng (footer)
```

---

## 3. TÓM TẮT CÁC FIX ĐÃ THỰC HIỆN

### 3.1 Fix CRITICAL (lỗi nghiêm trọng)

| # | Lỗi | Trước | Sau |
|---|---|---|---|
| 1 | **3 H1 ở trang chủ** | 3 thẻ H1 trong slider | 1 H1 visually hidden ở đầu, 3 slider thành H2 |
| 2 | **222 link `href="#"` rỗng** | Toàn bộ nav menu, dropdown không hoạt động | Tất cả trỏ về URL thật (`/be-ca#promax`, `/san-pham#equipment`...) |
| 3 | **Thiếu FAQ Schema** | 7 câu FAQ HTML không có schema | FAQPage schema với đầy đủ 7 câu |
| 4 | **Favicon sai MIME** | `type="image/png"` nhưng file `.jpg` 187KB | favicon.svg riêng + apple-touch-icon |
| 5 | **CSS lặp 5 lần (~800KB)** | CSS inline trùng nhau ở 5 trang | Tách ra `/css/main.css` cache được |

### 3.2 Fix HIGH (quan trọng)

| # | Lỗi | Giải pháp |
|---|---|---|
| 6 | Logo embed base64 (~50KB × 12 lần) | Thay bằng `/images/logo-light.svg` (~2KB) |
| 7 | Ảnh thiếu `loading`, `width`, `height` | Hero: `fetchpriority="high"`, dưới fold: `loading="lazy"` |
| 8 | Thiếu `<link rel="preload">` cho hero | Thêm preload với media query |
| 9 | Thiếu Schema Product, Service, Breadcrumb | Đã thêm cho từng trang phù hợp |
| 10 | Trang chủ thiếu `<main>` | Thêm `<main id="main">` wrap content |
| 11 | Không có skip-to-content (a11y) | Thêm `<a class="skip-to-content">` |
| 12 | OG image không chuẩn 1200×630 | Cần tạo riêng `/images/og-image.jpg` |

### 3.3 Fix MEDIUM (cải tiến)

| # | Lỗi | Giải pháp |
|---|---|---|
| 13 | Sitemap không có hreflang, ISO 8601 | Đã update với `<xhtml:link>` và datetime đầy đủ |
| 14 | robots.txt sơ sài | Đã có rules cho Googlebot, image bot, chặn AhrefsBot |
| 15 | Không có HTTP security headers | `_headers` với HSTS, CSP, X-Frame-Options |
| 16 | Không có cache strategy | `_headers` với cache 1 năm cho assets |
| 17 | Thiếu PWA manifest | Đã tạo `site.webmanifest` |
| 18 | 404 page indexable | Đã thêm `meta robots noindex` |
| 19 | `theme-color` thiếu | Đã thêm `<meta name="theme-color">` |
| 20 | Schema Organization sơ sài | Đã có ContactPoint, sameAs, logo |

### 3.4 Hiệu quả đo được

| Metric | Trước | Sau | Cải thiện |
|---|---|---|---|
| Kích thước trang chủ | 221KB | ~85KB | -61% |
| Kích thước trang con (mỗi trang) | 196KB | ~48KB | -75% |
| Tổng kích thước 6 trang HTML | ~1.2MB | ~325KB | -73% |
| Số H1 trang chủ | 3 (sai) | 1 (đúng) | ✓ |
| Số link rỗng | 222 | 0 | ✓ |
| Schema types | 2 | 8+ | +400% |

---

## 4. CHI TIẾT KỸ THUẬT TỪNG FILE

### 4.1 `index.html` (Trang chủ)

**Mục đích**: Landing page giới thiệu thương hiệu và 3 dòng bể chủ lực

**Schema bao gồm**:
- `Organization` - Thông tin công ty
- `LocalBusiness` - Doanh nghiệp địa phương + giờ mở cửa
- `WebSite` - Site root identifier
- `ItemList` - 3 sản phẩm (ProMax, Infinity, Custom) với giá range

**Heading structure**:
```
H1: 2D Aquatic - Bể cá biển cao cấp & San hô tại Hà Nội (visually-hidden)
├── H2: 2D ProMax S Series (slide 1)
├── H2: 2D Infinity S Series (slide 2)
├── H2: 2D Custom Design (slide 3)
├── H2: Mọi thứ bạn cần cho hệ sinh thái hoàn hảo
├── H2: Tư vấn miễn phí, hỗ trợ 24/7
├── H3: Bể cao cấp cho mọi không gian
├── H3: Lọc, đèn LED, skimmer chính hãng
├── H3: Reef Balance — nước hoàn hảo
├── H3: Sinh vật tươi sống, BH 7 ngày
└── H4: Liên hệ (footer), Công ty TNHH 2D Aquatic
```

**Critical CSS**:
- Inline 1572 dòng (đã tách ra `/css/home.css`)
- Bao gồm slider, animations, mega menu

**Performance**:
- Preload `slide1-desktop.jpg` cho LCP (>820px)
- Preload `slide1-mobile.jpg` cho LCP (<820px)
- Lazy load slide 2, 3
- Font display: swap

### 4.2 `be-ca/index.html`

**Schema bao gồm**:
- `Organization`, `LocalBusiness` (chung)
- `BreadcrumbList`: Trang chủ → Bể cá
- `CollectionPage` với `ItemList` 3 Product (có price, warranty)

**H1**: "Bể cá biển chuẩn mực, cho mọi không gian"

**URL anchor**:
- `#promax` - Section ProMax
- `#infinity` - Section Infinity
- `#custom` - Section Custom Design

### 4.3 `san-pham/index.html`

**Schema bao gồm**:
- `BreadcrumbList`: Trang chủ → Sản phẩm
- `CollectionPage`

**H1**: "Tất cả phụ kiện cho bể cá biển"

**URL anchor**:
- `#equipment` - Lọc, skimmer, đèn LED
- `#chemicals` - Hóa chất Reef Balance
- `#livestock` - Cá biển, san hô

### 4.4 `dich-vu/index.html`

**Schema bao gồm**:
- `BreadcrumbList`: Trang chủ → Dịch vụ
- `Service` với `OfferCatalog` 3 dịch vụ:
  - Setup bể mới trọn gói
  - Bảo trì định kỳ
  - Tư vấn 1-1 với chuyên gia

**H1**: "Setup, bảo trì, tư vấn 1-1"

**URL anchor**:
- `#setup` - Setup bể mới
- `#maintenance` - Bảo trì
- `#consulting` - Tư vấn

### 4.5 `ho-tro/index.html` ⭐ QUAN TRỌNG

**Schema bao gồm**:
- `BreadcrumbList`: Trang chủ → Hỗ trợ
- `FAQPage` với 7 câu Q&A đầy đủ ⭐

**H1**: "Hướng dẫn, FAQ & bảo hành"

**Lý do đặc biệt**: FAQPage schema có thể hiển thị **Rich Snippets** trên Google SERP, tăng CTR đáng kể.

**Để test**: https://search.google.com/test/rich-results

### 4.6 `lien-he/index.html`

**Schema bao gồm**:
- `BreadcrumbList`: Trang chủ → Liên hệ
- `ContactPage` linked với `LocalBusiness`

**H1**: "Đến thăm shop hoặc gọi cho chúng tôi"

### 4.7 `404.html`

- `<meta name="robots" content="noindex, follow">`
- `<link rel="canonical" href="https://2daquatic.com/">`
- Không có sitemap entry

### 4.8 CSS Architecture

```
css/
├── main.css           ~50KB - Shared (5 trang con + nav, footer trang chủ)
├── home.css           ~38KB - Slider, animations, mega menu (chỉ trang chủ)
└── seo-additions.css  ~1KB  - Skip-link, sr-only, logo SVG
```

**Chiến lược cache**: `Cache-Control: public, max-age=31536000, immutable`

Khi update CSS, đổi tên file (ví dụ: `main.v2.css`) hoặc thêm query string `?v=20260509`.

---

## 5. SCHEMA.ORG STRUCTURED DATA

### 5.1 Tổng quan các schema

| Schema | Trang sử dụng | Mục đích |
|---|---|---|
| `Organization` | Tất cả | Định danh công ty |
| `LocalBusiness` | Tất cả | Doanh nghiệp địa phương |
| `WebSite` | Trang chủ | Site root |
| `BreadcrumbList` | 5 trang con | Breadcrumb navigation |
| `ItemList` + `Product` | Trang chủ, /be-ca | Catalog sản phẩm |
| `CollectionPage` | /be-ca, /san-pham | Trang catalog |
| `Service` + `OfferCatalog` | /dich-vu | Dịch vụ |
| `FAQPage` | /ho-tro | Rich snippets FAQ ⭐ |
| `ContactPage` | /lien-he | Trang liên hệ |

### 5.2 Cách validate

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. Trong Google Search Console: **Enhancements** → **FAQ**, **Breadcrumbs**, **Products**

### 5.3 Cập nhật schema khi có thay đổi

**Khi thay đổi giá**: Update trong `index.html` và `be-ca/index.html`:
```json
"offers": {
  "@type": "AggregateOffer",
  "priceCurrency": "VND",
  "lowPrice": "8000000",   // ← Sửa ở đây
  "highPrice": "15000000"  // ← Và đây
}
```

**Khi thêm FAQ mới** (`ho-tro/index.html`):
1. Thêm vào HTML:
```html
<details class="faq-item">
  <summary class="faq-question">Câu hỏi mới?</summary>
  <div class="faq-answer">Câu trả lời...</div>
</details>
```

2. Thêm vào FAQPage schema:
```json
{
  "@type": "Question",
  "name": "Câu hỏi mới?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Câu trả lời..."
  }
}
```

⚠️ **Quan trọng**: Text trong schema phải GIỐNG HỆT text hiển thị, nếu không Google sẽ coi là spam.

---

## 6. HƯỚNG DẪN TRIỂN KHAI

### 6.1 Triển khai lên Netlify (khuyến nghị)

```bash
# Cách 1: Drag & drop folder fixed-website lên app.netlify.com
# Cách 2: Git deploy
git init
git add .
git commit -m "Initial commit - SEO optimized"
git remote add origin https://github.com/YOUR_USERNAME/2daquatic.git
git push -u origin main
# Sau đó connect repo trong Netlify dashboard
```

**Cấu hình Netlify**:
- Build command: (để trống - HTML tĩnh)
- Publish directory: `/` (root của repo)
- File `_redirects` và `_headers` sẽ tự áp dụng

### 6.2 Triển khai lên Cloudflare Pages

`_redirects` và `_headers` của Netlify cũng tương thích với Cloudflare Pages.

### 6.3 Triển khai lên Vercel

Đổi `_redirects` thành `vercel.json`:
```json
{
  "redirects": [
    {"source": "/index.html", "destination": "/", "permanent": true},
    {"source": "/san-pham.html", "destination": "/san-pham", "permanent": true}
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Frame-Options", "value": "SAMEORIGIN"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload"}
      ]
    }
  ]
}
```

### 6.4 Cấu hình Domain

1. **Mua domain `2daquatic.com`** (nếu chưa có)
2. Trong Netlify: **Domain settings** → **Add custom domain**
3. Update DNS:
```
A     @     75.2.60.5
CNAME www   2daquatic.netlify.app
```
4. Bật **HTTPS** + **Force HTTPS redirect**

### 6.5 Sau khi deploy

#### Bước 1: Verify Google Search Console
1. Vào https://search.google.com/search-console
2. Add property: `https://2daquatic.com`
3. Verify qua DNS TXT record hoặc HTML file
4. Submit sitemap: `https://2daquatic.com/sitemap.xml`

#### Bước 2: Verify Bing Webmaster Tools
1. Vào https://www.bing.com/webmasters
2. Add site, verify, submit sitemap

#### Bước 3: Setup Analytics
**Google Analytics 4** (khuyến nghị):
```html
<!-- Thêm vào <head> trước </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Hoặc dùng **Plausible/Umami** (privacy-friendly, không cần consent banner GDPR).

#### Bước 4: Test với các công cụ

| Tool | URL | Mục tiêu |
|---|---|---|
| PageSpeed Insights | https://pagespeed.web.dev/ | Mobile ≥ 80, Desktop ≥ 90 |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly | Pass |
| Rich Results Test | https://search.google.com/test/rich-results | FAQ, Breadcrumb, Product detected |
| Schema Validator | https://validator.schema.org/ | No errors |
| HTTPS Test | https://www.ssllabs.com/ssltest/ | Grade A+ |
| Security Headers | https://securityheaders.com/ | Grade A |
| GTmetrix | https://gtmetrix.com/ | Performance ≥ 90 |

---

## 7. HƯỚNG DẪN BẢO TRÌ & CẬP NHẬT

### 7.1 Khi thêm trang mới

1. **Tạo file HTML** mới copy từ template `be-ca/index.html`
2. **Update head**:
   - `<title>` mới
   - `<meta description>` mới
   - `<link canonical>` đúng URL
   - `<meta og:url>`, `<meta og:title>`, `<meta og:description>`
   - BreadcrumbList schema phù hợp
3. **Thêm vào `sitemap.xml`**:
```xml
<url>
  <loc>https://2daquatic.com/url-moi</loc>
  <lastmod>2026-XX-XX</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```
4. **Update internal links** ở các trang khác trỏ đến trang mới
5. **Submit URL** trong Google Search Console: **URL Inspection** → **Request indexing**

### 7.2 Khi cập nhật nội dung

#### Update sản phẩm/giá
- Update trong HTML (text hiển thị)
- Update trong JSON-LD schema (`Product` → `offers` → `lowPrice`/`highPrice`)
- Update `<lastmod>` trong `sitemap.xml`

#### Update FAQ
- Update HTML `<details>`/`<summary>` 
- Update FAQPage schema (text phải MATCH)
- Test lại với Rich Results Test

#### Update logo
- Sửa file `/images/logo-light.svg`
- Sửa file `/images/logo-dark.svg`
- Cache busting: rename file (logo-v2.svg) hoặc dùng query string

### 7.3 Khi đổi domain

1. Update tất cả `https://2daquatic.com` → domain mới (search & replace)
2. Files cần update:
   - Tất cả `index.html` (canonical, OG, schema)
   - `sitemap.xml`
   - `robots.txt`
   - `site.webmanifest`
3. Setup 301 redirect từ domain cũ → mới
4. Update Google Search Console (Change of Address)

### 7.4 Quy trình kiểm tra hàng tháng

- [ ] Kiểm tra Google Search Console: errors, coverage, performance
- [ ] Kiểm tra Core Web Vitals (CrUX report)
- [ ] Crawl bằng Screaming Frog SEO Spider (free 500 URLs)
- [ ] Kiểm tra link gãy (broken links)
- [ ] Update `<lastmod>` trong sitemap nếu có nội dung mới
- [ ] Backup toàn bộ website

---

## 8. CHECKLIST KIỂM TRA TRƯỚC LAUNCH

### 8.1 Technical SEO

- [x] Mỗi trang có đúng 1 H1 duy nhất
- [x] Title tag 50-60 ký tự, mô tả 150-160 ký tự
- [x] Canonical URL chính xác cho mỗi trang
- [x] Meta robots: `index, follow` (trừ 404)
- [x] Hreflang: `vi-VN` + `x-default`
- [x] Open Graph + Twitter Card đầy đủ
- [x] Favicon SVG + Apple touch icon
- [x] Site manifest JSON cho PWA
- [x] Sitemap.xml với image sitemap, hreflang
- [x] Robots.txt với rules đầy đủ
- [x] HTTPS với HSTS preload
- [x] Security headers (CSP, X-Frame-Options, Referrer-Policy)
- [x] 404 page noindex
- [x] Skip-to-content link (a11y)

### 8.2 Performance

- [x] CSS tách ra file riêng (cache được)
- [x] Logo SVG (không base64)
- [x] Hero image preload
- [x] Lazy load ảnh dưới fold
- [x] Width/height cho mọi `<img>` (chống CLS)
- [x] Font display: swap
- [x] DNS prefetch + preconnect
- [ ] Convert ảnh sang WebP (cần làm thủ công, xem mục 10.2)
- [ ] Tạo OG image 1200x630 chuẩn (cần làm thủ công)

### 8.3 Schema.org

- [x] Organization schema
- [x] LocalBusiness schema (đầy đủ với geo, openingHoursSpecification)
- [x] WebSite schema (trang chủ)
- [x] BreadcrumbList (5 trang con)
- [x] Product/ItemList (trang chủ, /be-ca)
- [x] Service (/dich-vu)
- [x] FAQPage (/ho-tro) ⭐
- [x] ContactPage (/lien-he)

### 8.4 Content & UX

- [x] Tất cả link nav trỏ về URL thật (không có href="#")
- [x] Có `<main>` tag ở mọi trang
- [x] Internal linking giữa các trang
- [x] CTA rõ ràng (gọi điện, Zalo, Facebook)
- [x] Form contact validate đúng
- [x] Mobile responsive (đã có picture/source)

### 8.5 Sau khi deploy

- [ ] Submit sitemap.xml vào Google Search Console
- [ ] Submit sitemap.xml vào Bing Webmaster Tools
- [ ] Verify domain ownership
- [ ] Cài Google Analytics 4 hoặc Plausible
- [ ] Test PageSpeed Insights (mobile ≥ 80, desktop ≥ 90)
- [ ] Test Rich Results (FAQ phải pass)
- [ ] Test Mobile-Friendly
- [ ] Test SSL Labs (grade A+)
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Tạo backup tự động

---

## 9. SEO TRACKING & KPIs

### 9.1 KPIs theo mốc thời gian

#### Tháng 1 (Indexing phase)
- [ ] 100% trang được Google index
- [ ] 0 errors trong Search Console
- [ ] Sitemap submitted thành công
- [ ] FAQ rich snippets bắt đầu xuất hiện

#### Tháng 2-3 (Ranking phase)
- [ ] Brand search "2D Aquatic" → top 1
- [ ] "bể cá biển hà nội" → top 10
- [ ] "setup bể san hô" → top 20
- [ ] CTR trung bình ≥ 5% (do FAQ rich snippets)

#### Tháng 4-6 (Growth phase)
- [ ] "bể cá biển hà nội" → top 3-5
- [ ] "bể cá biển cao cấp" → top 10
- [ ] "bể san hô setup" → top 10
- [ ] Organic traffic tăng 200%+
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 9.2 Từ khóa target

#### Primary keywords (intent cao)
- bể cá biển hà nội
- bể cá biển cao cấp
- setup bể cá biển
- bể san hô hà nội
- 2D Aquatic

#### Secondary keywords
- bể cá biển lọc vách
- bể cá biển lọc tràn dưới
- bể cá biển ProMax
- bể cá biển Infinity
- thiết bị bể cá biển
- đèn LED bể cá biển
- skimmer bể cá biển
- hóa chất Reef Balance
- bảo trì bể cá biển

#### Long-tail keywords
- bể cá biển bao nhiêu tiền
- bể cá biển có khó nuôi không
- setup bể cá biển trọn gói hà nội
- giá bể cá biển 100 lít
- chi phí setup bể san hô

### 9.3 Tracking trong Google Search Console

Theo dõi các metric sau:
- **Total clicks** (organic)
- **Total impressions**
- **Average CTR**
- **Average position**
- **Top queries** (xem keyword nào ranking)
- **Top pages** (trang nào hiệu quả nhất)
- **Coverage**: Valid pages, Errors, Warnings
- **Enhancements**: FAQ, Breadcrumbs, Products

### 9.4 Tracking conversions

Setup events trong GA4:
- `phone_call` - Click số điện thoại
- `zalo_click` - Click link Zalo
- `facebook_click` - Click Facebook
- `form_submit` - Submit form liên hệ
- `direction_click` - Click "chỉ đường" Google Maps

---

## 10. TROUBLESHOOTING

### 10.1 Trang không được index

**Triệu chứng**: Search trên Google `site:2daquatic.com` không thấy trang.

**Kiểm tra**:
1. `robots.txt` có chặn không? → Test: https://2daquatic.com/robots.txt
2. Meta robots có `noindex` không? → Xem source HTML
3. Submit URL trong Google Search Console: **URL Inspection** → **Request Indexing**
4. Sitemap có URL đó không?
5. Đợi 7-14 ngày sau khi submit

### 10.2 Cần convert ảnh sang WebP

```bash
# Cài đặt cwebp
sudo apt install webp

# Convert
cd images/
cwebp -q 85 slide1-desktop.jpg -o slide1-desktop.webp
cwebp -q 85 slide1-mobile.jpg -o slide1-mobile.webp
cwebp -q 85 slide2-desktop.jpg -o slide2-desktop.webp
cwebp -q 85 slide2-mobile.jpg -o slide2-mobile.webp
```

Sau đó update HTML:
```html
<picture>
  <source media="(max-width: 820px)" type="image/webp" srcset="/images/slide1-mobile.webp">
  <source media="(max-width: 820px)" srcset="/images/slide1-mobile.jpg">
  <source type="image/webp" srcset="/images/slide1-desktop.webp">
  <img src="/images/slide1-desktop.jpg" alt="..." width="1361" height="560" fetchpriority="high">
</picture>
```

### 10.3 Tạo OG image chuẩn 1200×630

Có thể tạo bằng:
- **Canva** (template OG image)
- **Figma** (export 1200×630 PNG/JPG)
- **Photoshop**

Quy tắc:
- Logo + tên brand rõ ràng
- Tagline ngắn
- Ảnh sản phẩm flagship
- Tránh text quá nhỏ (sẽ không đọc được khi Facebook crop)
- File `<300KB`, format JPG hoặc PNG

Lưu vào `/images/og-image.jpg` rồi update các meta tag:
```html
<meta property="og:image" content="https://2daquatic.com/images/og-image.jpg">
```

### 10.4 Test FAQ rich snippets không hiện

1. Test với https://search.google.com/test/rich-results
2. Đảm bảo text trong schema GIỐNG HỆT text trong HTML
3. Đợi 1-4 tuần sau khi update
4. Đảm bảo `<details>`/`<summary>` markup đúng
5. Không ẩn FAQ bằng CSS `display:none` (Google có thể bỏ qua)

### 10.5 Core Web Vitals không pass

#### LCP > 2.5s
- Preload hero image
- Convert WebP
- Tối ưu fonts (swap, preload)
- Giảm CSS render-blocking

#### CLS > 0.1
- Thêm `width` + `height` cho mọi img/iframe
- Reserve space cho ad/banner
- Tránh inject content trên top page

#### FID/INP > 100ms
- Giảm JavaScript thực thi
- Defer/async scripts
- Tránh long task

### 10.6 Site bị penalty / drop ranking

1. Kiểm tra **Manual actions** trong Search Console
2. Check **Security issues**
3. Check thuật toán update (https://moz.com/google-algorithm-change)
4. Kiểm tra backlink toxic (Ahrefs, SEMrush)
5. Audit content quality

---

## PHỤ LỤC A: Code snippets quan trọng

### A.1 Template `<head>` cho trang mới

```html
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0a1628">

<title>[TIÊU ĐỀ] | 2D Aquatic</title>
<meta name="description" content="[MÔ TẢ 150-160 KÝ TỰ]">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://2daquatic.com/[URL]">

<link rel="alternate" hreflang="vi-VN" href="https://2daquatic.com/[URL]">
<link rel="alternate" hreflang="x-default" href="https://2daquatic.com/[URL]">

<!-- OG -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://2daquatic.com/[URL]">
<meta property="og:title" content="[TIÊU ĐỀ] | 2D Aquatic">
<meta property="og:description" content="[MÔ TẢ NGẮN]">
<meta property="og:image" content="https://2daquatic.com/images/og-image.jpg">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="2D Aquatic">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[TIÊU ĐỀ]">
<meta name="twitter:description" content="[MÔ TẢ NGẮN]">
<meta name="twitter:image" content="https://2daquatic.com/images/og-image.jpg">

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Stylesheets -->
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/seo-additions.css">

<!-- Schema.org -->
<script type="application/ld+json">{...}</script>
</head>
```

### A.2 Template Product schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tên sản phẩm",
  "description": "Mô tả sản phẩm",
  "brand": {"@type": "Brand", "name": "2D Aquatic"},
  "image": "https://2daquatic.com/images/product.jpg",
  "sku": "MSP-001",
  "offers": {
    "@type": "Offer",
    "url": "https://2daquatic.com/san-pham/product-slug",
    "priceCurrency": "VND",
    "price": "1500000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {"@id": "https://2daquatic.com/#business"}
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47"
  }
}
```

### A.3 Template Article schema (cho blog tương lai)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tiêu đề bài viết",
  "image": "https://2daquatic.com/images/article-1.jpg",
  "datePublished": "2026-05-09T08:00:00+07:00",
  "dateModified": "2026-05-09T08:00:00+07:00",
  "author": {
    "@type": "Person",
    "name": "Tên tác giả"
  },
  "publisher": {
    "@type": "Organization",
    "name": "2D Aquatic",
    "logo": {
      "@type": "ImageObject",
      "url": "https://2daquatic.com/images/logo-light.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://2daquatic.com/blog/article-slug"
  }
}
```

---

## PHỤ LỤC B: Liên hệ & hỗ trợ

| Vai trò | Liên hệ |
|---|---|
| Chủ website | 2D Aquatic |
| Hosting | Netlify (đề xuất) |
| Domain | (tùy nhà cung cấp) |
| Search Console | https://search.google.com/search-console |
| Bing Webmaster | https://www.bing.com/webmasters |
| Analytics | Google Analytics 4 |

---

## PHỤ LỤC C: Tài liệu tham khảo

### Google official
- [Search Central](https://developers.google.com/search)
- [Core Web Vitals](https://web.dev/vitals/)
- [Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Schema.org
- [Schema.org docs](https://schema.org/docs/full.html)
- [Schema Validator](https://validator.schema.org/)
- [LocalBusiness](https://schema.org/LocalBusiness)
- [FAQPage](https://schema.org/FAQPage)
- [Product](https://schema.org/Product)

### Tools
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) (Free 500 URLs)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [SecurityHeaders.com](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Ahrefs](https://ahrefs.com/) (Paid, recommended)
- [SEMrush](https://www.semrush.com/) (Paid)

---

**END OF DOCUMENT**

> Tài liệu này được tạo tự động cùng với optimized website source code.
> Khi cập nhật website, vui lòng update tài liệu này song song.
> Phiên bản hiện tại: 1.0 | Cập nhật cuối: 09/05/2026
