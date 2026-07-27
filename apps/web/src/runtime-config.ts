const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const PRODUCTION_API_ORIGIN = 'https://chronicle-rift-api.onrender.com';

export function apiBaseUrl(
  configured: string | undefined,
  hostname = globalThis.location?.hostname ?? 'localhost',
) {
  if (configured?.trim()) return configured.replace(/\/$/, '');
  return LOCAL_HOSTS.has(hostname)
    ? 'http://localhost:3000/api'
    : `${PRODUCTION_API_ORIGIN}/api`;
}

export function socketBaseUrl(
  configured: string | undefined,
  hostname = globalThis.location?.hostname ?? 'localhost',
) {
  if (configured?.trim()) return configured.replace(/\/$/, '');
  return LOCAL_HOSTS.has(hostname)
    ? 'http://localhost:3100'
    : PRODUCTION_API_ORIGIN;
}
