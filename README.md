# Chronicle Rift — Phase 1–11

Monorepo MVP triển khai Authentication/Profile, catalog, Deck Builder, game engine, Campaign/AI, Pack/Crafting, PvP realtime, Ranked Season và Limited Event theo `game.docx`.

## Chạy local

1. Copy `.env.example` thành `.env`.
2. `docker compose up -d postgres`
3. `corepack pnpm install`
4. `corepack pnpm db:generate && corepack pnpm db:migrate && corepack pnpm db:seed`
5. `corepack pnpm dev` — web `http://localhost:5173`, API `http://localhost:3000`.

## Kiểm tra

`corepack pnpm lint && corepack pnpm typecheck && corepack pnpm test && corepack pnpm build`

## Test thủ công

- Đăng ký: tài khoản nhận collection và hai starter deck, mật khẩu chỉ tồn tại dưới dạng Argon2 hash.
- Đăng nhập, để access token hết hạn/đổi token và xác nhận request tự refresh.
- Mở collection, thử search/filter và modal chi tiết.
- Thêm/bớt thẻ, kiểm tra giới hạn 2 bản (Legendary 1), deck khác faction và nút lưu chỉ bật ở 20 lá.
- Gửi API protected không token phải nhận 401; thử sửa deck/user của tài khoản khác phải nhận 404.
- Battle: giữ bài, chơi unit/spell, đổi lượt, tấn công và kiểm tra victory/defeat.
- Campaign: hoàn thành từng stage, xác nhận stage kế tiếp mở và reward không cộng lần hai.
- Pack: mở cùng `requestId` hai lần, xác nhận Gold chỉ trừ một lần; kiểm tra pity/history và duplicate-to-Dust.
- PvP: mở hai trình duyệt/tài khoản, chọn deck rồi cùng vào Casual hoặc Ranked; refresh và reconnect trong 90 giây.
- Ranked: hoàn thành trận Ranked, kiểm tra rating/tier và leaderboard phân trang.
- Event: hoàn thành 12 stage Đêm Nhật Thực, nhận Eclipse Token và đổi vật phẩm trong thời gian UTC hợp lệ.

## Phạm vi chưa làm

Phase 11 production hardening, E2E/load test và deployment đã được triển khai.

## Production và kiểm thử

- `corepack pnpm --filter @chronicle/web test:e2e`: Playwright Chromium cho luồng đăng ký → collection → deck → campaign → pack.
- `corepack pnpm --filter @chronicle/web test:load`: smoke load HTTP + WebSocket.
- `docker compose -f docker-compose.prod.yml build`: build API và Nginx web production.
- `docker compose -f docker-compose.prod.yml up -d`: chạy staging tại `http://localhost:8080` sau khi cung cấp secrets.
- `scripts/backup.ps1` và `scripts/restore.ps1`: backup/restore PostgreSQL. Xem [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) để deploy và rollback.
- Metrics dạng Prometheus tại `/metrics`; mỗi response có `x-request-id` và API logs ở dạng JSON.

## Socket events

- Client: `matchmaking:join`, `match:join`, `match:action`.
- Server: `matchmaking:status`, `match:found`, `match:state`, `match:reconnected`, `match:error`, `match:end`.
- Mọi action dùng `actionId`; state đối thủ được lọc để không lộ hand/deck.
