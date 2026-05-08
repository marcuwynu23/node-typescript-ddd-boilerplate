import type { Request, Response } from 'express';
import pinoHttp from 'pino-http';
import { createLogger } from '../../infrastructure/observability/logger';

const logger = createLogger();

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
