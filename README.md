# Dual Stage

Website hiển thị 2 khu vực video song song với hệ thống quản trị phân quyền.

## Cấu trúc thư mục

```
dual-stage/
├── pages/
│   ├── index.js          # Trang chính (hiển thị video A + B)
│   ├── admin.js          # Trang quản trị (login + dashboard)
│   ├── _app.js
│   └── api/
│       ├── content.js          # GET /api/content
│       ├── login.js            # POST /api/login
│       └── content/[role].js   # POST /api/content/A hoặc /api/content/B
├── lib/
│   ├── db.js             # SQLite database helper
│   └── video.js          # Chuyển đổi URL video thành embed URL
├── data/                 # Tự tạo khi chạy lần đầu (chứa content.db)
├── .env.local            # Biến môi trường (KHÔNG commit lên git)
├── next.config.js
└── package.json
```

## Cài đặt & chạy local

### 1. Cài đặt dependencies

```bash
npm install
```

> Lưu ý: `better-sqlite3` cần build native module. Nếu gặp lỗi, cài thêm:
> ```bash
> # macOS: xcode-select --install
> # Ubuntu/Debian: sudo apt install python3 make g++
> ```

### 2. Cấu hình mật khẩu

Mở file `.env.local` và thay đổi mật khẩu:

```env
ADMIN_PASSWORD_A=mat_khau_cua_A
ADMIN_PASSWORD_B=mat_khau_cua_B
JWT_SECRET=chuoi_bi_mat_ngau_nhien_dai
```

**Quan trọng:** `JWT_SECRET` phải là chuỗi ngẫu nhiên dài, khó đoán.

### 3. Chạy development

```bash
npm run dev
```

Mở trình duyệt: http://localhost:3000

### 4. Build production

```bash
npm run build
npm start
```

---

## Hướng dẫn sử dụng

### Trang chính
- Truy cập http://localhost:3000
- Hiển thị video A (trái) và video B (phải)
- Tự động cập nhật mỗi 30 giây
- Responsive: trên mobile, A và B xếp dọc

### Trang quản trị
- Nhấn nút ⚙ góc dưới phải, hoặc truy cập http://localhost:3000/admin
- Nhập mật khẩu A → chỉnh sửa Zone A
- Nhập mật khẩu B → chỉnh sửa Zone B
- Paste link YouTube hoặc TikTok vào ô video
- Nhập caption (tối đa 300 từ)
- Nhấn "Lưu thay đổi"

### Link video được hỗ trợ
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- YouTube rút gọn: `https://youtu.be/VIDEO_ID`
- TikTok: `https://www.tiktok.com/@username/video/VIDEO_ID`

---

## Deploy lên Vercel

### Vấn đề với SQLite trên Vercel
Vercel là serverless, filesystem không persistent. Cần thay SQLite bằng database cloud.

### Cách dễ nhất: Dùng Vercel KV (Redis)

1. Trong Vercel dashboard → Storage → Create KV store
2. Cài package: `npm install @vercel/kv`
3. Thay `lib/db.js` bằng implementation dùng `@vercel/kv`:

```js
import { kv } from '@vercel/kv';

export async function getContent() {
  const data = await kv.hgetall('content') || {};
  return {
    videoUrlA: data.videoUrlA || '',
    captionA: data.captionA || '',
    updatedAtA: data.updatedAtA || '',
    videoUrlB: data.videoUrlB || '',
    captionB: data.captionB || '',
    updatedAtB: data.updatedAtB || '',
  };
}

export async function updateContent(role, videoUrl, caption) {
  const now = new Date().toISOString();
  await kv.hset('content', {
    [`videoUrl${role}`]: videoUrl,
    [`caption${role}`]: caption,
    [`updatedAt${role}`]: now,
  });
}
```

4. Đổi `getServerSideProps` trong `pages/index.js` thành async:
```js
export async function getServerSideProps() {
  const { getContent } = await import('../lib/db');
  const content = await getContent(); // thêm await
  return { props: { initialContent: content } };
}
```

### Biến môi trường trên Vercel
Vào Settings → Environment Variables, thêm:
- `ADMIN_PASSWORD_A`
- `ADMIN_PASSWORD_B`
- `JWT_SECRET`
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` (tự động từ KV store)

---

## Deploy lên Render

1. Push code lên GitHub
2. Render → New Web Service → kết nối repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Thêm environment variables
6. SQLite sẽ hoạt động nếu dùng persistent disk (Render hỗ trợ)

---

## Bảo mật

- Mật khẩu nằm hoàn toàn trong backend (`.env.local`), không bao giờ gửi ra frontend
- JWT token hết hạn sau 8 giờ
- API kiểm tra role trước khi cho phép cập nhật
- Role A không thể sửa Zone B và ngược lại

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/content` | Lấy toàn bộ nội dung A và B |
| POST | `/api/login` | Đăng nhập, nhận JWT token |
| POST | `/api/content/A` | Cập nhật Zone A (cần token role A) |
| POST | `/api/content/B` | Cập nhật Zone B (cần token role B) |
