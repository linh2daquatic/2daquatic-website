# 🚀 Hướng dẫn deploy lên Cloudflare Pages

> Phiên bản fix ngày 15/05/2026 — đã chuyển từ Netlify sang Cloudflare hoàn toàn

---

## ⚡ BƯỚC 1: Fix vấn đề CSS hiển thị lỗi NGAY (5 phút)

Nếu site đang live ở `2daquatic.com` mà bạn vẫn thấy chữ "2D Aquatic - Bể cá biển..." đen to đè lên hero, làm theo thứ tự:

### A. Purge cache Cloudflare

1. Vào https://dash.cloudflare.com → chọn domain **2daquatic.com**
2. Menu trái → **Caching** → **Configuration**
3. Bấm nút **Purge Everything** (màu cam)
4. Confirm

### B. Deploy code mới

**Cách 1 — Drag-and-drop (nhanh nhất):**

1. Giải nén `2daquatic-website-fixed.zip` → có folder `fixed/`
2. Vào Cloudflare → **Workers & Pages** → chọn project `2daquatic`
3. Tab **Deployments** → bấm **Create deployment**
4. Kéo cả folder `fixed/` (hoặc folder `dist/` nếu đã build) vào ô upload
5. Đợi 30-60s

**Cách 2 — Git push (nếu connect GitHub):**

```bash
git add -A
git commit -m "Fix CSS visually-hidden + chuyển sang Cloudflare backend"
git push
```

### C. Hard refresh

- Mở `2daquatic.com` trong **Incognito** (Cmd/Ctrl+Shift+N)
- Bấm **Cmd/Ctrl+Shift+R** để force reload

Site sẽ load CSS file mới `seo-additions.v2.css` (file mới hoàn toàn → không có cache cũ).

---

## 🔐 BƯỚC 2: Cấu hình CMS admin với GitHub OAuth

Phải làm bước này thì `/admin` mới hoạt động.

### A. Tạo GitHub OAuth App

1. Vào https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Điền:
   - **Application name**: `2D Aquatic CMS`
   - **Homepage URL**: `https://2daquatic.com`
   - **Authorization callback URL**: `https://2daquatic.com/api/callback`
3. Bấm **Register application**
4. Lưu lại **Client ID**
5. Bấm **Generate a new client secret** → lưu lại **Client Secret** (chỉ hiện 1 lần!)

### B. Set environment variables trên Cloudflare

1. Cloudflare Dashboard → **Workers & Pages** → project `2daquatic`
2. **Settings** → **Environment variables**
3. Bấm **Add variable** (chọn **Production**):

| Variable name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | (Client ID từ bước A) |
| `GITHUB_CLIENT_SECRET` | (Client Secret từ bước A) — chọn **Encrypt** |

4. Bấm **Save** → Cloudflare sẽ tự rebuild

### C. Update `admin/config.yml`

Mở file `admin/config.yml`, đổi dòng:

```yaml
repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
```

Thành tên repo thực, ví dụ:

```yaml
repo: linhtts/2daquatic-website
```

(Format: `<github-username>/<repo-name>`)

### D. Test admin

1. Truy cập `https://2daquatic.com/admin/`
2. Bấm **Login with GitHub**
3. Cho phép app
4. → Vào dashboard CMS, có thể chỉnh sản phẩm/bài viết/FAQ

**Lưu ý:** Bạn phải có quyền **write** vào repo GitHub thì mới CMS được. Nếu nhiều người quản lý, thêm họ làm collaborator của repo.

---

## 📧 BƯỚC 3: Cấu hình form liên hệ với Web3Forms

Phải làm bước này thì form ở trang `/lien-he` mới gửi được email.

### A. Lấy Web3Forms Access Key

1. Vào https://web3forms.com
2. Nhập email nhận tin nhắn (ví dụ `thelinhtts2@gmail.com`)
3. Bấm **Create Access Key**
4. Web3Forms gửi email với **Access Key** dạng `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

(Free 250 submissions/tháng, không cần tạo tài khoản)

### B. Update HTML

Mở file `lien-he/index.html`, tìm dòng:

```html
<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">
```

Thay `YOUR_WEB3FORMS_ACCESS_KEY` bằng key thật từ email.

### C. Test form

1. Vào `https://2daquatic.com/lien-he`
2. Điền và gửi form
3. → Kiểm tra email, sẽ có tin nhắn từ Web3Forms
4. Browser auto chuyển về `/cam-on`

---

## 📋 Checklist sau khi deploy

- [ ] CSS hero không còn chữ H1 đè lên (Bước 1)
- [ ] `/admin` đăng nhập GitHub được (Bước 2)
- [ ] Form liên hệ gửi email được (Bước 3)
- [ ] Sản phẩm thấy đúng anchor: `/be-ca#promax` scroll đến ProMax
- [ ] Cal.com đặt lịch hiển thị bình thường ở `/lien-he`
- [ ] Google Maps iframe hiển thị

---

## ❓ Troubleshooting

### "Site vẫn lỗi sau khi deploy"

→ Cache không xóa được, làm lại:
1. Cloudflare Dashboard → Caching → **Purge Everything**
2. Browser: mở DevTools (F12) → Network tab → tích **Disable cache** → reload

### "Admin báo lỗi 'Failed to load auth endpoint'"

→ Environment variables chưa set đúng. Vào Cloudflare → check `GITHUB_CLIENT_ID` và `GITHUB_CLIENT_SECRET` đã có chưa, **Production** scope đã tick chưa.

### "Form không gửi được"

→ Mở DevTools → Console xem có error. Thường là quên đổi `YOUR_WEB3FORMS_ACCESS_KEY` thành key thật.

### "Cal.com không hiện"

→ Check CSP trong `_headers` có `https://app.cal.com` và `https://cal.com` trong `script-src` không. Đã có sẵn trong file mới.

---

## 🗂️ Cấu trúc thư mục mới

```
2daquatic-website/
├── _headers              ← CSP, cache rules
├── _redirects            ← URL redirects
├── admin/                ← CMS panel (Decap CMS)
│   ├── index.html
│   └── config.yml        ← ⚠️ cần đổi 'repo:' field
├── functions/            ← Cloudflare Pages Functions (OAuth)
│   └── api/
│       ├── auth.js       ← /api/auth - khởi đầu OAuth
│       └── callback.js   ← /api/callback - hoàn tất OAuth
├── css/
│   ├── main.css          ← (file cũ, giữ lại fallback)
│   ├── main.v2.css       ← ⭐ mới - HTML load file này
│   ├── home.v2.css       ← ⭐ mới
│   └── seo-additions.v2.css ← ⭐ mới - chứa .visually-hidden FIX
├── lien-he/index.html    ← form đã chuyển sang Web3Forms
├── index.html, ...       ← các trang khác
└── ...
```

Sau 1-2 tuần stable, có thể xóa các file `.css` cũ (không có `.v2`).
