import type { Request, Response } from 'express';

export class DocsAPIController {
  docsRedirect = (_req: Request, res: Response): void => {
    res.redirect('/docs');
  };
}
