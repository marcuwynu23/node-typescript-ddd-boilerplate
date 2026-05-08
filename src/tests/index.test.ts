import request from 'supertest';
import { app } from '../index';

describe('Express API', () => {
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

  it('exposes Prometheus metrics on GET /metrics', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/plain/);
    expect(response.text).toMatch(/http_requests_total/);
    expect(response.text).toMatch(/http_request_duration_seconds/);
  });
});
