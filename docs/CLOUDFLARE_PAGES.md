# Deploy Chronicle Rift lên Cloudflare Pages

Frontend là Vite SPA và tiếp tục dùng API Render + Neon hiện tại.

1. Vào **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Chọn repository `nguyekie/chronicle-rift`, nhánh production `main`.
3. Đặt **Root directory**: `apps/web`.
4. Đặt **Build command**: `corepack pnpm build`.
5. Nếu giao diện có **Build output directory**, đặt: `dist`.
6. Nếu giao diện có ô **Deploy command**, không dùng `npx wrangler deploy`. Đặt chính xác:

   `npx wrangler pages deploy dist --project-name chronicle-rift`

   Lệnh `wrangler deploy` dành cho Workers và sẽ báo lỗi auto-detection khi chạy ở root monorepo.
7. Thêm biến môi trường production:
   - `NODE_VERSION` = `22`
   - `PNPM_VERSION` = `10.13.1`
   - `VITE_API_URL` = `https://chronicle-rift-api.onrender.com/api`
8. Chọn **Save and Deploy**. Không bấm retry build cũ trước khi lưu cấu hình mới, vì retry dùng lại deploy command cũ.

Cloudflare Pages tự nhận SPA khi output không có `404.html`. File `_headers` trong `apps/web/public` được Vite sao chép vào bản build để thiết lập cache và security headers.

API chấp nhận các domain `*.pages.dev`. Nếu dùng domain riêng, thêm domain đó vào biến `WEB_ORIGIN` trên Render, phân tách nhiều domain bằng dấu phẩy.
