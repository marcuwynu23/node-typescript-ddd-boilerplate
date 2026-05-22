import request from 'supertest';
import { app } from '../interface/http/app';

describe('Express API - Integration', () => {
  it('returns welcome message on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Hello from Express + TypeScript + esbuild!',
    });
  });

  it('returns health payload on GET /api/health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });

  it('returns health payload on GET /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns health payload on GET /ready', async () => {
    const response = await request(app).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('exposes Prometheus metrics on GET /metrics', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/plain/);
    expect(response.text).toMatch(/http_requests_total/);
    expect(response.text).toMatch(/http_request_duration_seconds/);
  });

  it('redirects /api/docs to /docs', async () => {
    const response = await request(app).get('/api/docs');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/docs');
  });
});
