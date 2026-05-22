import './infrastructure/config/config';
import './infrastructure/tracer/tracer';
import * as os from 'os';
import { config } from './infrastructure/config/config';
import { connectDatabase } from './infrastructure/database/connection';
import { app } from './interface/http/app';

async function bootstrap() {
  await connectDatabase();
  const networkIP = Object.values(os.networkInterfaces())
    .flat()
    .find((i) => i && i.family === 'IPv4' && !i.internal && !i.address.startsWith('127'))?.address;
  app.listen(config.port, config.host, () => {
    console.log(`http://${config.host}:${config.port}`);
    console.log(`http://localhost:${config.port}`);
    if (networkIP) console.log(`http://${networkIP}:${config.port}`);
  });
}

if (require.main === module) {
  bootstrap();
}

export { app };
