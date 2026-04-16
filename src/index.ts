import express, { Request, Response } from 'express';
import pinoHttp from 'pino-http';
import { createLogger } from './observability/logger';
import { metricsHandler, metricsMiddleware } from './observability/metrics';

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const logger = createLogger();
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);
app.use(metricsMiddleware);

app.get('/metrics', metricsHandler);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript + esbuild!' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(Number(port), host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
}

export {app};
