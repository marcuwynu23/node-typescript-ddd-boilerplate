import { trace } from '@opentelemetry/api';
import type { Request, Response } from 'express';

export class HealthController {
  check = (_req: Request, res: Response): void => {
    const span = trace.getActiveSpan();
    console.log('traceId:', span?.spanContext()?.traceId);
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  };
}
