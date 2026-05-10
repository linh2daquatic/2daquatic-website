# 🚀 HƯỚNG DẪN DEPLOY 2D AQUATIC - TỪ A ĐẾN Z

> **Cho người không rành kỹ thuật** - Làm theo từng bước, không bỏ qua bước nào.
>
> **Thời gian dự kiến**: 30-45 phút (lần đầu)

---

## 📋 BẠN CẦN CHUẨN BỊ TRƯỚC

- [ ] File `2d-aquatic-website-seo-optimized.zip` đã tải về
- [ ] Tài khoản email (Gmail là tốt nhất)
- [ ] Tên miền `2daquatic.com` (nếu chưa có thì mua sau)
- [ ] Trình duyệt Chrome/Firefox/Edge

---

## PHẦN A: GIẢI NÉN FILE WEBSITE

### Bước A1: Tải và giải nén
1. Mở file `2d-aquatic-website-seo-optimized.zip` đã tải về
2. **Click chuột phải** → **Extract All / Giải nén tất cả**
3. Chọn thư mục giải nén (ví dụ: `Desktop/2D-Aquatic`)
4. Sau khi giải nén bạn sẽ thấy folder tên `fixed-website` chứa toàn bộ code

### Bước A2: Kiểm tra cấu trúc
Mở folder `fixed-website`, bạn phải thấy:
```
fixed-website/
├── index.html          ← Trang chủ
├── 404.html
├── favicon.ico
├── apple-touch-icon.png
├── icon-192.png, icon-512.png
├── be-ca/, dich-vu/, ho-tro/, lien-he/, san-pham/
├── css/                ← Files CSS
├── images/             ← Logo mới + ảnh slide
├── _headers, _redirects
├── sitemap.xml, robots.txt
└── site.webmanifest
```

✅ Nếu có đủ → tiếp tục. Nếu thiếu → tải lại ZIP.

---

## PHẦN B: DEPLOY LÊN NETLIFY (CÁCH DỄ NHẤT)

> **Tại sao chọn Netlify?**
> - Miễn phí
> - Tự động cấp HTTPS (SSL)
> - Tốc độ load cực nhanh (CDN toàn cầu)
> - Drag & drop là xong, không cần code
> - Hỗ trợ `_redirects` và `_headers` của bạn

### Bước B1: Đăng ký tài khoản Netlify

1. Mở trình duyệt → Vào **https://app.netlify.com/signup**
2. Click **"Sign up with Email"** (hoặc Google nếu muốn nhanh)
3. Nhập email + mật khẩu
4. Vào email xác nhận, click link
5. Đăng nhập vào https://app.netlify.com

### Bước B2: Deploy website (CÁCH NHANH NHẤT - DRAG & DROP)

1. Sau khi đăng nhập, bạn ở trang **"Sites"** hoặc dashboard chính
2. Tìm khu vực có chữ **"Want to deploy a new site without connecting to Git?"**
3. Hoặc: Click nút **"Add new site"** → chọn **"Deploy manually"**
4. Sẽ hiện ô có chữ **"Drag and drop your site output folder here"**

5. **QUAN TRỌNG**: Mở folder `fixed-website` đã giải nén ở Bước A1
6. **KÉO TOÀN BỘ FOLDER `fixed-website`** (không phải file zip) thả vào ô trên Netlify
7. Đợi 30-60 giây để upload và build

### Bước B3: Site đã online!

✨ Sau khi xong bạn sẽ thấy URL tạm thời kiểu:
```
https://random-name-12345.netlify.app
```

**Click vào URL này** → Website đã chạy! Kiểm tra:
- Trang chủ có hiện đầy đủ slider không?
- Logo "2D Aquatic" có hiển thị đúng không?
- Click vào menu Bể cá, Sản phẩm... có vào được không?
- Mở trên điện thoại xem responsive không?

---

## PHẦN C: ĐỔI TÊN URL (TÙY CHỌN, NHƯNG KHUYẾN NGHỊ)

### C1: Đổi sang tên dễ nhớ trên Netlify
Nếu chưa có domain riêng, đổi tên cho dễ nhớ:

1. Trong dashboard site → **"Site settings"** (hoặc **"Domain management"**)
2. Click **"Change site name"**
3. Nhập tên mong muốn, ví dụ: `2daquatic` → URL sẽ là `https://2daquatic.netlify.app`
4. Save

### C2: Connect domain riêng `2daquatic.com`

#### Nếu bạn đã có domain `2daquatic.com`:

1. Trong Netlify: **Site settings** → **Domain management** → **Add custom domain**
2. Nhập `2daquatic.com` → Verify
3. Netlify sẽ hiện 2 cách trỏ DNS:

**Cách 1 (Khuyến nghị)**: Dùng **Netlify DNS**
- Đổi nameservers tại nhà cung cấp domain (GoDaddy, Namecheap, Mắt Bão...) thành:
  ```
  dns1.p01.nsone.net
  dns2.p01.nsone.net
  dns3.p01.nsone.net
  dns4.p01.nsone.net
  ```
  (Netlify sẽ cho bạn 4 nameservers cụ thể)

**Cách 2**: Dùng DNS riêng, chỉ trỏ A record và CNAME
- Vào trang quản lý DNS của domain (Cloudflare, GoDaddy...)
- Thêm các record:
  ```
  Type: A      Name: @       Value: 75.2.60.5
  Type: CNAME  Name: www     Value: <site-name>.netlify.app
  ```

4. Đợi DNS propagation (15 phút - 24 giờ)
5. Sau khi xong, Netlify tự động cấp **SSL certificate** miễn phí

#### Nếu CHƯA CÓ domain:
- Mua tại: **Mắt Bão** (matbao.net), **Tenten**, **Namecheap**, **GoDaddy**...
- Giá `.com` khoảng 200-300k VND/năm
- Mua xong làm theo hướng dẫn ở trên

---

## PHẦN D: SAU KHI DEPLOY - CÁC VIỆC QUAN TRỌNG

### D1: ✅ Verify Google Search Console (BẮT BUỘC LÀM)

> Đây là bước quan trọng nhất để Google biết website của bạn tồn tại!

1. Vào: **https://search.google.com/search-console**
2. Đăng nhập bằng Gmail
3. Click **"Add property"**
4. Chọn **"URL prefix"** (cột phải) → Nhập: `https://2daquatic.com`
5. Verify bằng 1 trong các cách (chọn dễ nhất là **HTML tag**):

**Cách HTML tag**:
- Google sẽ cho bạn 1 đoạn code kiểu: `<meta name="google-site-verification" content="abc123..." />`
- Copy đoạn code đó
- Mở file `fixed-website/index.html` trên máy bạn (dùng Notepad hoặc Notepad++)
- Tìm dòng `<meta name="googlebot" content="index, follow">`
- Thêm dòng meta verification của Google ngay dưới
- Save file
- Upload lại lên Netlify (drag & drop folder lại)
- Trở lại Google Search Console → Click **"Verify"**

6. Sau khi verify thành công → Vào **"Sitemaps"** ở menu trái
7. Nhập: `sitemap.xml` → Click **Submit**
8. Đợi vài giờ → Google sẽ bắt đầu index

### D2: ✅ Submit URL từng trang (SPEED UP INDEXING)

Trong Google Search Console:
1. Trên cùng có ô **"URL inspection"**
2. Lần lượt nhập từng URL → Click **"Request indexing"**:
   - `https://2daquatic.com/`
   - `https://2daquatic.com/be-ca`
   - `https://2daquatic.com/san-pham`
   - `https://2daquatic.com/dich-vu`
   - `https://2daquatic.com/ho-tro`
   - `https://2daquatic.com/lien-he`

### D3: ✅ Setup Google Analytics 4 (THEO DÕI TRAFFIC)

1. Vào **https://analytics.google.com** → Đăng nhập
2. **Admin** → **Create Account** → Nhập "2D Aquatic"
3. Tạo Property → Web → Nhập URL `https://2daquatic.com`
4. Sau khi tạo, lấy **Measurement ID** dạng `G-XXXXXXXXXX`
5. Mở file `fixed-website/index.html` (và 5 trang con)
6. Tìm dòng `</head>` (gần đầu file)
7. Thêm đoạn này NGAY TRƯỚC `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
(Thay `G-XXXXXXXXXX` bằng Measurement ID của bạn)

8. Save tất cả 6 file → Upload lại lên Netlify

### D4: ✅ Test website với các công cụ chính thức

| Tool | Link | Phải đạt |
|---|---|---|
| **PageSpeed Insights** | https://pagespeed.web.dev/ | Mobile ≥ 75, Desktop ≥ 85 |
| **Mobile-Friendly** | https://search.google.com/test/mobile-friendly | "Page is mobile friendly" ✓ |
| **Rich Results** | https://search.google.com/test/rich-results | FAQ + Breadcrumbs + Product detected |
| **SSL Test** | https://www.ssllabs.com/ssltest/ | Grade A+ |
| **Security Headers** | https://securityheaders.com/ | Grade A |

Cách test:
1. Vào link tool
2. Nhập `https://2daquatic.com`
3. Đợi kết quả
4. Nếu có lỗi → đọc trong file `SEO-FOUNDATION.md` mục **10. Troubleshooting**

---

## PHẦN E: KẾT NỐI MẠNG XÃ HỘI

### E1: Test Open Graph (preview khi share Facebook/Zalo)

1. Vào: **https://developers.facebook.com/tools/debug/**
2. Nhập `https://2daquatic.com` → Click **Debug**
3. Phải hiện đúng:
   - Logo 2D Aquatic
   - Title: "2D Aquatic - Bể cá biển cao cấp..."
   - Description đầy đủ
   - Hình OG (đã tạo sẵn ở `/images/og-image.jpg`)

Nếu sai → Click **"Scrape again"** để Facebook cập nhật cache.

### E2: Add link website vào các nền tảng

- [ ] **Facebook page** 2D Aquatic → Edit → About → Website
- [ ] **Zalo OA** → Cập nhật website
- [ ] **Google Maps** → My Business → Thêm website
- [ ] Bio Instagram, TikTok (nếu có)
- [ ] Chữ ký email

---

## PHẦN F: BẢO TRÌ HÀNG THÁNG

### F1: Cập nhật nội dung
Nếu cần sửa text/giá/sản phẩm:
1. Mở file HTML cần sửa bằng **Notepad++** (Windows) hoặc **VS Code** (mọi OS)
2. Tìm text cần đổi → Sửa
3. Save
4. Upload lại folder lên Netlify (drag & drop)
5. Site update ngay lập tức (vài giây)

### F2: Theo dõi định kỳ
- **Tuần 1**: Check Google Search Console mỗi 2-3 ngày xem có index không
- **Tháng đầu**: Vào GSC xem **Performance** → có click chưa, từ khóa nào
- **Hàng tháng**: Đọc **Coverage** xem có lỗi không, đọc **Enhancements** → FAQ pass không

### F3: Backup
- Folder `fixed-website` của bạn chính là backup
- Mỗi lần sửa code, save file và đổi tên thành `fixed-website-2026-MM-DD`
- Upload Google Drive hoặc lưu cứng

---

## ⚠️ KHI GẶP VẤN ĐỀ

### "Site không hiện trên Google"
- Mất 7-14 ngày để Google index. Hãy kiên nhẫn.
- Vào Search Console → URL Inspection → Request Indexing.
- Đảm bảo `robots.txt` không chặn (mặc định không chặn).

### "Logo bị mờ trên mobile"
- File `logo-light@2x.png` lo việc đó. Nếu vẫn mờ:
- Mở DevTools (F12) → tab Network → reload → xem ảnh đang load là @1x hay @2x
- Có thể browser cache cũ → Hard refresh (Ctrl+Shift+R)

### "Form liên hệ không gửi được"
- Form HTML hiện tại là demo. Cần tích hợp:
  - **Netlify Forms** (miễn phí, dễ nhất): Thêm `data-netlify="true"` vào `<form>`, Netlify sẽ tự nhận và lưu submissions trong dashboard
  - Hoặc Formspree, Web3Forms...
- Đọc thêm: https://docs.netlify.com/forms/setup/

### "Muốn thêm trang mới (ví dụ /blog)"
- Đọc `SEO-FOUNDATION.md` mục **7.1 Khi thêm trang mới**

### "Ai đó liên hệ qua email/Zalo nhưng không thấy đến từ website"
- Cài Google Analytics 4 (Bước D3) để track
- Setup events `phone_click`, `zalo_click`...

---

## 🎯 CHECKLIST CUỐI CÙNG

Sau khi làm xong mọi bước, bạn phải có:

- [ ] Website chạy tại `https://2daquatic.com` (HTTPS)
- [ ] Logo "2D Aquatic" hiển thị đúng (không bị vỡ)
- [ ] Tất cả 6 trang vào được, không lỗi 404
- [ ] Mở trên điện thoại OK
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Google Analytics tracking
- [ ] PageSpeed mobile ≥ 75
- [ ] Rich Results test FAQ pass
- [ ] OG image hiện đúng khi share Facebook
- [ ] Đã add link website vào FB page, Zalo OA

---

## 📞 LIÊN HỆ KHI CẦN GIÚP ĐỠ

- **Netlify support**: support@netlify.com (English)
- **Google Search Console**: [Help docs](https://support.google.com/webmasters)
- **Tài liệu nội bộ**: Đọc lại `SEO-FOUNDATION.md` (32KB) - cực kỳ chi tiết
- **CHANGELOG**: Đọc `CHANGELOG.md` để biết những gì đã được tối ưu

---

## 🎉 CHÚC MỪNG!

Khi đã hoàn thành, website 2D Aquatic của bạn sẽ:
- ✅ Load nhanh (LCP < 2.5s)
- ✅ Đạt SEO score 95-100
- ✅ Mobile friendly
- ✅ Bảo mật A+
- ✅ Có FAQ rich snippets trên Google (sau 2-4 tuần)
- ✅ Sẵn sàng đón khách hàng!

> **Tip cuối**: Đừng quên cập nhật giá sản phẩm trong `Schema.org` mỗi 3-6 tháng để Google hiển thị đúng giá hiện tại trên kết quả tìm kiếm.

---

**Phiên bản**: 1.0 | **Ngày tạo**: 09/05/2026
**File này nên lưu trữ cùng folder website source code.**
