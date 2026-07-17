# Deploy Chronicle Rift lên Cloudflare Pages

Frontend là Vite SPA và tiếp tục dùng API Render + Neon hiện tại.

1. Vào **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Chọn repository `nguyekie/chronicle-rift`, nhánh production `main`.
3. Đặt **Root directory** là thư mục gốc repository.
4. Đặt **Build command**: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @chronicle/web build`.
5. Đặt **Build output directory**: `apps/web/dist`.
6. Thêm biến môi trường production:
   - `NODE_VERSION` = `22`
   - `PNPM_VERSION` = `10.13.1`
   - `VITE_API_URL` = `https://chronicle-rift-api.onrender.com/api`
7. Chọn **Save and Deploy**.

Cloudflare Pages tự nhận SPA khi output không có `404.html`. File `_headers` trong `apps/web/public` được Vite sao chép vào bản build để thiết lập cache và security headers.

API chấp nhận các domain `*.pages.dev`. Nếu dùng domain riêng, thêm domain đó vào biến `WEB_ORIGIN` trên Render, phân tách nhiều domain bằng dấu phẩy.
