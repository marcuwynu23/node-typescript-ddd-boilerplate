import type { RequestHandler } from 'express';

export const apiReference = (): RequestHandler => {
  return (_req, _res, next) => next();
};
