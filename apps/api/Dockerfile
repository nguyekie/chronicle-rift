FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @chronicle/api exec prisma generate && pnpm --filter @chronicle/api build
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
USER node
EXPOSE 3000
CMD ["sh","-c","pnpm --filter @chronicle/api exec prisma migrate deploy && pnpm --filter @chronicle/api exec prisma db seed && node apps/api/dist/server.js"]
