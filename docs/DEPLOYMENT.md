# Production deployment

1. Copy `.env.example` to a protected production environment file and set strong database/JWT secrets.
2. Run `docker compose -f docker-compose.prod.yml build`.
3. Run migrations as a one-off task before switching traffic: `docker compose -f docker-compose.prod.yml run --rm api sh -c "cd apps/api && pnpm exec prisma migrate deploy"`.
4. Start with `docker compose -f docker-compose.prod.yml up -d`; verify `/health` and `/metrics` through port 8080.
5. Back up before every deployment with `scripts/backup.ps1`.

## Rollback

Application rollback: deploy the previous immutable image tag; database migrations are forward-only. For a destructive schema incident, stop writes, restore the latest verified backup using `scripts/restore.ps1`, then redeploy the matching image. Test restore operations regularly on a separate database.
