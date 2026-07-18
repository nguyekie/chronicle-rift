import { config } from './config.js';

const configuredOrigins = new Set([
  ...config.WEB_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const cloudflareOrigin = /^https:\/\/[a-z0-9.-]+\.(?:pages|workers)\.dev$/i;

export const isAllowedWebOrigin = (origin?: string) =>
  !origin || configuredOrigins.has(origin) || cloudflareOrigin.test(origin);

export const allowWebOrigin = (
  origin: string | undefined,
  done: (error: Error | null, allowed?: boolean) => void,
) => isAllowedWebOrigin(origin)
  ? done(null, true)
  : done(new Error('CORS_ORIGIN_DENIED'));
