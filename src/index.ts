import './infrastructure/config/config';
import './infrastructure/tracer/tracer';
import { config } from './infrastructure/config/config';
import { app } from './interface/http/app';

if (require.main === module) {
  app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
  });
}

export { app };
