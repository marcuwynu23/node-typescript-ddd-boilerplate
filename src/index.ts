import './infrastructure/config/config';
import './infrastructure/tracer/tracer';
import { config } from './infrastructure/config/config';
import { connectDatabase } from './infrastructure/database/connection';
import { app } from './interface/http/app';

async function bootstrap() {
  await connectDatabase();

  app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
  });
}

if (require.main === module) {
  bootstrap();
}

export { app };
