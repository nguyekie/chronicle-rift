# Changelog

## 0.11.0 — Phase 11

- Playwright E2E cho player journey và public legal/pack-rate endpoints.
- HTTP/WebSocket load smoke, API rate limiting, request IDs, JSON logs và Prometheus metrics.
- Public Privacy Policy, Terms placeholder và pack probability disclosure trong API/UI.
- Multi-stage Docker images, Nginx reverse proxy/cache, production Compose và GitHub Actions CI.
- PostgreSQL backup/restore scripts, deployment migration guide và rollback procedure.
- Fixed staging CORS mismatch between `localhost` and `127.0.0.1` discovered by E2E.

## 0.10.0 — Phase 8–10

- Phase 8: Socket.IO authentication, Casual/Ranked matchmaking, server-authoritative actions, state version, action idempotency, filtered opponent state, reconnect và 90-second disconnect timeout.
- Phase 9: Elo rating, Bronze–Legend tiers, paginated leaderboard, active season, match results và one-time season reward claim.
- Phase 10: Đêm Nhật Thực gồm 12 stage, Eclipse Token, exchange shop, UTC availability, Limited cosmetic serial và zero gameplay power bonus.

## 0.7.0 — Phase 4–7

- Phase 4: engine deterministic độc lập với seeded shuffle, mulligan, energy, ba hàng, unit/spell, attack, Taunt, Shield, Rush, Silence, event log và win condition.
- Phase 5: Battle UI local gồm board, hand, HP, energy, combat log, keyword tooltip, lỗi action và victory/defeat.
- Phase 6: Chapter 1 với 10 stage + boss hai phase, AI Easy/Normal/Boss, unlock, stars và reward idempotent.
- Phase 7: Basic/Faction/Starter packs, transaction + request idempotency, pity, history, duplicate-to-Dust, craft và dismantle.

## 0.3.0 — Phase 1–3

- Phase 1: register/login/refresh rotation/logout, profile, roles, protected API và auth UI/store.
- Phase 2: schema + seed 48 thẻ, catalog/collection filter, card detail và starter ownership server-side.
- Phase 3: deck CRUD, validation 20 lá/ownership/faction/copy limit, mana curve và hai starter deck.
