import { describe, expect, it } from 'vitest';
import { apiBaseUrl, socketBaseUrl } from './runtime-config';

describe('runtime production endpoints', () => {
  it('uses Render when the frontend is hosted publicly', () => {
    expect(apiBaseUrl(undefined, 'chronicle-rift.222001468.workers.dev'))
      .toBe('https://chronicle-rift-api.onrender.com/api');
    expect(socketBaseUrl(undefined, 'chronicle-rift.222001468.workers.dev'))
      .toBe('https://chronicle-rift-api.onrender.com');
  });

  it('keeps local development endpoints on localhost', () => {
    expect(apiBaseUrl(undefined, 'localhost')).toBe('http://localhost:3000/api');
    expect(socketBaseUrl(undefined, '127.0.0.1')).toBe('http://localhost:3100');
  });

  it('prefers explicitly configured endpoints', () => {
    expect(apiBaseUrl('https://api.example.com/api/', 'public.example.com'))
      .toBe('https://api.example.com/api');
    expect(socketBaseUrl('https://socket.example.com/', 'public.example.com'))
      .toBe('https://socket.example.com');
  });
});
