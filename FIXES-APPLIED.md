# Các fix đã áp dụng - 2D Aquatic Website

> Áp dụng ngày 15/05/2026 — fix toàn bộ 6 lỗi 🔴 nghiêm trọng

---

## ✅ FIX #1: Thêm anchor IDs vào các trang con

Trước đây các link như `/be-ca#promax`, `/san-pham#loc`, `/dich-vu#setup`... đều dẫn tới các section không có ID → click không scroll tới đâu.

**Đã thêm 14 IDs:**

| Trang | IDs thêm vào |
|---|---|
| `be-ca/index.html` | `id="promax"`, `id="infinity"`, `id="custom"` |
| `san-pham/index.html` | `id="loc"`, `id="den"`, `id="bom"`, `id="hoa-chat"`, `id="sinh-vat"`, `id="phu-kien"` |
| `dich-vu/index.html` | `id="setup"`, `id="bao-tri"`, `id="tu-van"` |
| `ho-tro/index.html` | `id="huong-dan"`, `id="bao-hanh"` (`id="faq"` đã có sẵn) |

---

## ✅ FIX #2: Đồng bộ URL toàn bộ site

Trước đây tồn tại 2 hệ thống naming song song không khớp.

**Chuẩn mới (áp dụng cho TẤT CẢ 9 file HTML):**

- URL: KHÔNG trailing slash → `/be-ca` (khớp canonical), bỏ `/be-ca/`
- Anchor: TIẾNG VIỆT → `#loc`, `#den`, `#bom`, `#hoa-chat`, `#sinh-vat`, `#phu-kien`, `#setup`, `#bao-tri`, `#tu-van`, `#huong-dan`, `#faq`, `#bao-hanh`, `#promax`, `#infinity`, `#custom`

**Đã thay:**

- `/be-ca/#promax` → `/be-ca#promax` (bỏ slash thừa)
- `/san-pham#equipment` → `/san-pham#loc`, `#den`, `#bom`, `#phu-kien` (theo từng card)
- `/san-pham#chemicals` → `/san-pham#hoa-chat`
- `/san-pham#livestock` → `/san-pham#sinh-vat`
- `/dich-vu#maintenance` → `/dich-vu#bao-tri`
- `/dich-vu#consulting` → `/dich-vu#tu-van`
- `/ho-tro#warranty` → `/ho-tro#bao-hanh`
- `/be-ca#nano` → `/be-ca#custom` (vì không có section Nano riêng)
- `#equipment`, `#chemicals`, `#livestock` trong showcase trang chủ → `/san-pham#...`

**Bug đã sửa:** Link "Hướng dẫn setup" trong mobile menu Hỗ trợ trước đây trỏ nhầm `/dich-vu#setup` — đã sửa thành `/ho-tro#huong-dan`.

---

## ✅ FIX #3: robots.txt viết lại

**Vấn đề cũ:**
- `Disallow: /*.html$` → chặn cả `index.html`
- `Disallow: /css/` → block CSS với Bingbot, FB crawler, Twitter crawler (chỉ Googlebot được Allow lại)

**Đã fix:** Bỏ 2 dòng nguy hiểm. Giữ rules block các bot rác và file kỹ thuật.

---

## ✅ FIX #4: CSP trong `_headers`

**Vấn đề cũ:** CSP chỉ cho phép `googletagmanager.com`, `google-analytics.com` ở `script-src` — sẽ block:
- Netlify Identity widget (admin)
- Decap CMS từ unpkg
- Cal.com embed (lien-he)
- Google Maps iframe (lien-he) — không có `frame-src`

**Đã thêm vào CSP:**
- `script-src`: `https://identity.netlify.com https://unpkg.com https://app.cal.com https://cal.com`
- `connect-src`: `https://identity.netlify.com https://api.netlify.com https://*.cal.com`
- `frame-src`: `https://www.google.com https://cal.com https://app.cal.com`

---

## ✅ FIX #5: Tạo file `_redirects` (30+ rules)

File không tồn tại dù CHANGELOG nói đã có. Đã tạo với:

- Trailing slash → no slash (10 rules): `/be-ca/ → /be-ca`
- `.html` → clean URL (8 rules): `/be-ca/index.html → /be-ca`
- URL tiếng Anh cũ → tiếng Việt: `/aquarium → /be-ca`, `/services → /dich-vu`, `/contact → /lien-he`...
- Common typos: `/be_ca → /be-ca`, `/beca → /be-ca`...
- Form thank-you aliases: `/thank-you → /cam-on`
- 404 fallback

---

## ✅ FIX #6: `netlify.toml` + `build.js`

**`netlify.toml`** (trước trống rỗng):
```toml
[build]
  command = "node build.js"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**`build.js`:**
- Thêm `_redirects` vào `ROOT_FILES` (trước đây bị thiếu)
- Bỏ comment "NO _redirects file"

---

## 🧪 Đã test

- ✅ `node build.js` chạy thành công → output ra `dist/`
- ✅ `_redirects` được copy đúng cách
- ✅ Không còn anchor chết nào trên 9 file HTML
- ✅ Tất cả 14 anchor IDs đều tồn tại đúng vị trí trên các trang đích

---

## 📌 Vẫn còn lỗi 🟡 và 🟢 (chưa fix trong lần này)

Nếu muốn fix nốt, đây là list:

- #7: `404.html` vẫn dùng logo base64 ~50KB (đổi sang `<img src="/images/logo-light.png">`)
- #8: Trang con thiếu preload hero image
- #9: CTA "Xem chi tiết" trên be-ca trỏ ra Facebook thay vì trang sản phẩm
- #10: `404.html` inline ~350 dòng CSS thay vì dùng main.css
- #11: JSON-LD `LocalBusiness` thiếu ảnh showroom thật
- #12: CMS slider default link `/be-ca#promax` trong admin/config.yml (OK vì đã fix anchor)
- #15: Sitemap.xml `lastmod` tất cả như nhau
- #16: `cam-on` thiếu schema và nav đầy đủ
- #17: `articles-index.json` không tự update khi admin thêm bài
- #18: Chưa convert ảnh sang WebP
- #19: Inline JS lớn trên index.html
- #20: CSP có `'unsafe-inline'` cho script-src
