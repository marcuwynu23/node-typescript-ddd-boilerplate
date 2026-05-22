import { apiReference } from '@scalar/express-api-reference';
import type { Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import { config } from '../../infrastructure/config/config';

function getOpenAPIPath(): string {
  const base = process.env.OPEN_API_SPEC_PATH ?? 'openapi';
  return path.isAbsolute(base)
    ? path.join(base, 'openapi.yaml')
    : path.join(process.cwd(), base, 'openapi.yaml');
}

export function setScalarMiddleware(app: Application) {
  if (config.scalarEnabled) {
    // Serve the raw OpenAPI YAML file so Scalar can fetch it
    app.get('/openapi.yaml', (_req, res) => {
      res.sendFile(getOpenAPIPath());
    });

    // Relax CSP for the /docs route so Scalar's CDN script and inline JS can load
    app.use(
      '/docs',
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
          },
        },
      }),
      apiReference({
        url: '/openapi.yaml',
      })
    );
  }
}
