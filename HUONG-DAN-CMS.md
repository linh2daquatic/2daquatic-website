# 📖 HƯỚNG DẪN QUẢN LÝ NỘI DUNG WEBSITE 2D AQUATIC

> Sau khi đã setup xong, bạn có thể quản lý mọi thứ qua giao diện admin **mà không cần biết code**.

---

## 🎯 BẠN CÓ THỂ LÀM GÌ QUA ADMIN?

| Việc | Có làm được? | Khó/Dễ |
|---|:-:|:-:|
| ✏️ Sửa text trên các trang | ✅ | ⭐ Dễ |
| 🖼️ Đổi ảnh slider trang chủ | ✅ | ⭐ Dễ |
| 📝 Viết bài blog mới | ✅ | ⭐ Dễ |
| 🛒 Thêm/sửa sản phẩm | ✅ | ⭐ Dễ |
| 📁 Tạo danh mục mới | ✅ | ⭐ Dễ |
| ❓ Quản lý câu FAQ | ✅ | ⭐ Dễ |
| 📞 Đổi hotline, địa chỉ | ✅ | ⭐ Dễ |
| 🗓️ Đặt lịch online (Cal.com) | ✅ | ⭐⭐ Trung bình (cần setup Cal.com) |
| 📧 Nhận form liên hệ qua email | ✅ | ⭐ Dễ (Netlify lo) |
| 🎨 Thay đổi layout/giao diện | ❌ | Cần dev |
| 💳 Thanh toán online tự động | ❌ | Cần platform khác |

---

## PHẦN A: SETUP LẦN ĐẦU (1 LẦN, 30 PHÚT)

### A1. Đẩy code lên GitHub (5 phút)

> Bắt buộc vì Decap CMS lưu data trên GitHub (miễn phí)

1. **Đăng ký GitHub** tại https://github.com/signup (miễn phí)
2. Sau khi đăng nhập, click nút **"+"** trên góc phải → **"New repository"**
3. Đặt tên: `2daquatic-website`
4. Để **Public** (Decap CMS yêu cầu) hoặc Private (cần Pro)
5. Click **"Create repository"**

6. Trên máy bạn:
   - Cài **GitHub Desktop**: https://desktop.github.com/ (dễ nhất, không cần code)
   - Mở app, đăng nhập GitHub
   - **File** → **Clone repository** → Chọn `2daquatic-website` → Clone về Desktop

7. Mở folder vừa clone, **copy toàn bộ files trong `fixed-website-cms`** vào đó
8. Trong GitHub Desktop: nhập commit message "Initial commit" → **Commit to main** → **Push origin**

### A2. Deploy lên Netlify với Git (10 phút)

1. Vào https://app.netlify.com → đăng nhập
2. **Add new site** → **Import an existing project**
3. Chọn **GitHub** → Authorize
4. Chọn repository `2daquatic-website`
5. Build settings (đã có sẵn trong `netlify.toml`):
   - **Build command**: `node build.js`
   - **Publish directory**: `.`
6. Click **Deploy site**

Sau 1-2 phút website sẽ online tại URL `random.netlify.app`.

### A3. Bật Netlify Identity (đăng nhập admin) (5 phút)

> Đây là tài khoản để bạn login vào trang admin

1. Trong Netlify dashboard → site của bạn → **Site configuration**
2. Tab **Identity** ở menu trái → click **Enable Identity**
3. Cuộn xuống mục **Registration preferences** → chọn **Invite only** (chỉ người được mời mới được đăng nhập)
4. Mục **External providers** (tùy chọn): bật Google để login bằng Gmail nhanh hơn
5. Mục **Services** → **Git Gateway** → click **Enable Git Gateway**

6. Tab **Identity** chính → click **Invite users** → nhập email của bạn → **Send**
7. Vào email → click link xác nhận → đặt mật khẩu

### A4. Truy cập admin lần đầu (2 phút)

1. Mở `https://your-site.netlify.app/admin/`
2. Click **Login with Netlify Identity** → đăng nhập bằng email vừa setup
3. ✅ Bạn đang ở trong giao diện admin!

---

## PHẦN B: CÁC TÁC VỤ HÀNG NGÀY

### 📝 B1. Viết bài blog mới

1. Vào `https://your-site.com/admin/`
2. Menu trái → click **📝 Bài viết**
3. Click nút **"New Bài viết"** (góc trên phải)
4. Điền các trường:
   - **Tiêu đề**: VD "5 lỗi thường gặp khi nuôi cá biển"
   - **Slug**: Tự động sinh, hoặc sửa thành `5-loi-thuong-gap-nuoi-ca-bien`
   - **Tác giả**: Mặc định "Đội ngũ 2D Aquatic"
   - **Ngày đăng**: Click chọn ngày
   - **Ảnh đại diện**: Click **Choose an image** → upload ảnh
   - **Mô tả ngắn**: 1-2 câu (sẽ hiện trên Google + Facebook khi share)
   - **Tags**: VD "kinh nghiệm, sai lầm, cá biển"
   - **Danh mục**: Chọn từ dropdown
   - **Nội dung**: Viết bằng giao diện như Word (bôi đậm, link, ảnh, list...)
   - **Đã xuất bản**: ✅ (để hiển thị)
5. Click **"Save"** ở góc trên phải
6. Click **"Publish now"** → chọn **"Publish now"**

⏰ **Sau 1-3 phút**: Netlify tự động build lại website. Bài viết của bạn sẽ xuất hiện tại `/blog/[slug]` và `/blog`.

---

### 🛒 B2. Thêm sản phẩm mới

1. Vào admin → **🛒 Sản phẩm** → **"New Sản phẩm"**
2. Điền:
   - **Tên sản phẩm**: VD "2D Infinity 300L"
   - **Slug**: `2d-infinity-300l`
   - **Danh mục**: Chọn từ dropdown
   - **Mô tả ngắn**: 1-2 câu mô tả
   - **Mô tả đầy đủ**: Viết chi tiết
   - **Ảnh chính**: Upload ảnh chính
   - **Ảnh phụ**: Có thể thêm 8 ảnh phụ
   - **Giá**: Nhập số (VD: 35000000 = 35 triệu)
   - **Giá khuyến mãi**: Để trống nếu không khuyến mãi
   - **Thông số kỹ thuật**: Click "+" thêm từng dòng (Dung tích, Kích thước, Bảo hành...)
   - **Còn hàng?**: ✅ hoặc ❌
   - **Sản phẩm nổi bật?**: ✅ nếu muốn hiện trên trang chủ
3. Click **Save** → **Publish now**

---

### 🖼️ B3. Đổi ảnh slider trang chủ

1. Vào admin → **⚙️ Cài đặt chung** → **Trang chủ - Slider**
2. Sẽ thấy danh sách 2 slide đang có
3. Click vào slide cần sửa
4. Thay đổi:
   - **Ảnh desktop**: Click ảnh → chọn ảnh mới → upload
   - **Ảnh mobile**: Tương tự
   - **Tiêu đề, mô tả, link CTA**: Sửa text
5. Hoặc click **Add** để thêm slide mới
6. **Save** → **Publish**

> 💡 **Lưu ý kích thước ảnh slider**:
> - Desktop: tỉ lệ 2.4:1 (VD: 1920×800px)
> - Mobile: tỉ lệ 3:4 hoặc 4:5 (VD: 900×1200px)

---

### ❓ B4. Thêm/sửa câu FAQ

1. Vào admin → **❓ Câu hỏi thường gặp** → **"New FAQ"**
2. Điền:
   - **Câu hỏi**: VD "Có thể nuôi cá biển trong phòng máy lạnh không?"
   - **Câu trả lời**: Viết chi tiết, có thể bôi đậm/link
   - **Thứ tự hiển thị**: VD 8 (sẽ là câu thứ 8)
   - **Hiển thị**: ✅
3. **Save** → **Publish**

✨ **Tự động xuất hiện**:
- Trên trang `/ho-tro`
- Trong **FAQ Schema** → có thể hiển thị **Rich Snippet** trên Google
- Tăng CTR đáng kể

---

### 📞 B5. Đổi hotline/địa chỉ

1. Vào admin → **⚙️ Cài đặt chung** → **Thông tin doanh nghiệp**
2. Sửa các trường:
   - Hotline 1, Hotline 2
   - Email
   - Địa chỉ
   - Giờ mở cửa
   - Facebook, Zalo URL
3. **Save** → **Publish**

---

## PHẦN C: SETUP CAL.COM (ĐẶT LỊCH ONLINE)

### C1. Đăng ký Cal.com (5 phút, miễn phí)

1. Vào https://cal.com/signup
2. Đăng ký bằng Gmail (nhanh nhất)
3. Chọn username: `2daquatic` → URL của bạn sẽ là `cal.com/2daquatic`

### C2. Tạo loại sự kiện "Tư vấn bể cá" (5 phút)

1. Trong dashboard Cal.com → **Event Types** → **Create**
2. Cấu hình:
   - **Title**: "Tư vấn & khảo sát bể cá"
   - **URL**: `tu-van-be-ca`
   - **Duration**: 30 phút
   - **Location**: Choose...
     - "Phone call" (tư vấn qua điện thoại)
     - hoặc "In-person" (đến showroom)
     - hoặc "On-site visit" (khảo sát tại nhà)
3. **Availability**: Chọn giờ làm việc 8h-21h
4. **Workflows** (tùy chọn): Tự động gửi SMS/Email nhắc nhở khách

### C3. Lấy URL booking để gắn vào website

URL của bạn sẽ là:
```
https://cal.com/2daquatic/tu-van-be-ca
```

### C4. Cập nhật vào website

1. Vào admin website → **📄 Trang nội dung** → **Trang Liên hệ**
2. Mục **URL Cal.com đặt lịch**: paste URL trên
3. **Save** → **Publish**

✅ Trang `/lien-he` của bạn sẽ có widget đặt lịch ngay trong trang!

---

## PHẦN D: NETLIFY FORMS - NHẬN TIN NHẮN KHÁCH

### D1. Bật Forms (1 phút)

Form đã được setup sẵn. Sau khi deploy lần đầu:

1. Netlify dashboard → site → tab **Forms**
2. Form `contact` đã tự động xuất hiện sau lần submit đầu tiên

### D2. Setup nhận thông báo qua email (3 phút)

1. Tab **Forms** → click vào form `contact`
2. **Settings & usage** → **Form notifications**
3. Click **Add notification** → **Email notification**
4. Nhập email của bạn (VD: thelinhtts2@gmail.com)
5. **Save**

✨ Từ giờ mỗi khi có khách điền form, bạn sẽ nhận email ngay lập tức.

### D3. Anti-spam (đã setup sẵn)

- Honeypot field (bot bị dụ điền vào field ẩn)
- Netlify reCAPTCHA tự động (free tier 100 submissions/tháng)

---

## PHẦN E: WORKFLOW HÀNG NGÀY MẪU

### Khi có sản phẩm mới về:

```
1. Chụp ảnh sản phẩm (mobile, đủ sáng)
2. Vào admin → 🛒 Sản phẩm → New
3. Điền tên, giá, mô tả, upload ảnh
4. Save → Publish
5. Chờ 1-3 phút → Sản phẩm online
6. Share link lên Facebook/Zalo
```

### Khi có hỏi đáp mới:

```
1. Khách hỏi qua điện thoại/Zalo
2. Bạn ghi nhận câu hỏi và trả lời
3. Vào admin → ❓ FAQ → New
4. Lưu câu Q&A
5. → Tự động vào FAQ Schema → Tăng SEO
```

### Khi viết blog:

```
1. Soạn nội dung bằng giấy/Notes
2. Vào admin → 📝 Bài viết → New
3. Copy paste nội dung, upload ảnh
4. Set ngày đăng tương lai (Schedule)
5. Save → Publish
```

---

## PHẦN F: BACKUP & KHÔI PHỤC

### Vì lưu trên GitHub, bạn LUÔN có backup:

- Mỗi lần Save trên admin → tự động commit lên GitHub
- Lịch sử: https://github.com/[username]/2daquatic-website/commits
- Muốn revert: GitHub → click commit cũ → Revert

### Backup local:

- Mỗi tháng: GitHub Desktop → **Repository** → **Show in Explorer**
- Copy folder ra ổ cứng riêng / Google Drive

---

## PHẦN G: TROUBLESHOOTING

### "Không vào được /admin/"
- Kiểm tra Identity đã enable chưa (Netlify dashboard → Identity)
- Kiểm tra Git Gateway đã enable chưa
- Thử logout rồi login lại

### "Save xong nhưng không thấy đổi trên website"
- Đợi 1-3 phút (Netlify đang build)
- Vào tab **Deploys** xem có đang build không
- Hard refresh trình duyệt (Ctrl+Shift+R)
- Nếu fail: xem log build trong Netlify

### "Build fail"
- Vào **Deploys** → click deploy bị fail → xem log
- Thường là do markdown sai cú pháp → quay lại admin sửa

### "Form không nhận được tin nhắn"
- Kiểm tra spam folder
- Vào **Forms** → xem submission có vào không
- Setup notification email lại

### "Ảnh upload bị lỗi"
- File quá lớn (max 5MB) → resize trước
- Định dạng phải là JPG/PNG/WebP/SVG

---

## 📊 GHI CHÚ VỀ HIỆU SUẤT

| Hành động | Thời gian website cập nhật |
|---|---|
| Sửa text/giá sản phẩm | 1-2 phút |
| Thêm sản phẩm mới | 1-3 phút |
| Đăng bài blog mới | 1-3 phút |
| Đổi ảnh slider | 2-4 phút (do ảnh lớn) |
| Đổi hotline/địa chỉ | 1-2 phút |

> Lý do có delay: Netlify cần build lại website tĩnh để đạt tốc độ load cực nhanh cho khách. Đây là **đánh đổi tốt** so với CMS động (load chậm hơn nhưng update tức thì).

---

## 💰 CHI PHÍ HÀNG THÁNG

| Dịch vụ | Free tier | Đủ dùng cho 2D Aquatic? |
|---|---|---|
| **Netlify** (hosting + build) | 100GB bandwidth, 300 build minutes | ✅ Vô hạn |
| **Netlify Forms** | 100 submissions/tháng | ✅ Đủ (trừ khi spam) |
| **Netlify Identity** | 5 users | ✅ Đủ (chỉ admin dùng) |
| **GitHub** | Public repo unlimited | ✅ Đủ |
| **Cal.com** | Unlimited bookings | ✅ Đủ |
| **Domain `.com`** | ~250k VND/năm | Bắt buộc trả |

**Tổng**: ~250k VND/năm cho domain. **Mọi thứ khác miễn phí vĩnh viễn**.

---

## 🎓 HỌC THÊM

- Decap CMS docs: https://decapcms.org
- Netlify docs: https://docs.netlify.com
- Cal.com docs: https://cal.com/docs
- Markdown syntax: https://www.markdownguide.org/basic-syntax/

---

**Phiên bản**: 1.0 | **Ngày**: 09/05/2026
**Tác giả**: 2D Aquatic Web Optimization Team

> **Tip cuối**: Lưu file này lại! Đây là cuốn cẩm nang cho website của bạn.
