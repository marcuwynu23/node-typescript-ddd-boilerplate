import express from 'express';
import { httpLogger } from '../middlewares/httpLogger';
import { metricsMiddleware } from '../middlewares/metrics';
import { setScalarMiddleware } from '../middlewares/scalar';
import routes from './routes';

const app = express();

app.use(httpLogger);
app.use(metricsMiddleware);
setScalarMiddleware(app);
app.use(routes);

export { app };
