import '../../infrastructure/config/config';
import type { Request, RequestHandler, Response } from 'express';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [registry],
});

export const metricsMiddleware: RequestHandler = (req: Request, res: Response, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationSeconds = Number(end - start) / 1e9;

    const route = req.route?.path ? String(req.route.path) : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    } as const;

    httpRequestsTotal.inc(labels, 1);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
};

export const metricsHandler: RequestHandler = async (_req, res) => {
  res.setHeader('Content-Type', registry.contentType);
  res.send(await registry.metrics());
};
