# Triển khai miễn phí

Kiến trúc đề xuất: Netlify Free (web) + Render Free Web Service (API/WebSocket) + Neon Free PostgreSQL.

## 1. Tạo cơ sở dữ liệu Neon

1. Tạo project PostgreSQL và sao chép connection string dạng `postgresql://...?...sslmode=require`.
2. Trên máy local, đặt connection string vào `DATABASE_URL`, sau đó chạy:
   `corepack pnpm --filter @chronicle/api exec prisma migrate deploy`
3. Khởi tạo dữ liệu game:
   `corepack pnpm --filter @chronicle/api exec prisma db seed`

## 2. Triển khai API trên Render

Kết nối repository và chọn **New > Blueprint**. Trong Blueprint, có thể bỏ qua dịch vụ web tĩnh `chronicle-rift` nếu dùng Netlify; chỉ giữ API `chronicle-rift-api`.

Thiết lập các biến chưa được tự sinh:

- API `DATABASE_URL`: connection string của Neon.
- API `WEB_ORIGIN`: URL Netlify, ví dụ `https://chronicle-rift.netlify.app`.

## 3. Triển khai giao diện trên Netlify

1. Chọn **Add new project > Import an existing project** và kết nối repository.
2. Netlify tự đọc `netlify.toml`; thư mục xuất bản là `apps/web/dist`.
3. Trong **Project configuration > Environment variables**, thêm:
   - `VITE_API_URL=https://chronicle-rift-api.onrender.com/api`
   - `VITE_SOCKET_URL=https://chronicle-rift-api.onrender.com`
4. Deploy lại website, sao chép URL `*.netlify.app`, đặt URL đó vào `WEB_ORIGIN` của API rồi deploy lại API.

Sau khi thay biến `VITE_*`, deploy lại Netlify vì các biến này được đóng gói lúc build.

## Giới hạn cần biết

API miễn phí của Render sẽ ngủ sau 15 phút không có HTTP/WebSocket và lần mở đầu có thể mất khoảng một phút. Dữ liệu nằm ở Neon nên không mất khi API ngủ hoặc triển khai lại.
