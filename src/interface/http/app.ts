import express from 'express';
import { httpLogger } from '../middlewares/httpLogger';
import { metricsMiddleware } from '../middlewares/metrics';
import routes from './routes';

const app = express();

app.use(httpLogger);
app.use(metricsMiddleware);
app.use(routes);

export { app };
