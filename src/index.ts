import './infrastructure/config/config';
import './infrastructure/tracer/tracer';
import * as os from 'node:os';
import { config } from './infrastructure/config/config';
import { connectDatabase } from './infrastructure/database/connection';
import { app } from './interface/http/app';

async function bootstrap() {
  await connectDatabase();

  const interfaces = Object.values(os.networkInterfaces()).flat();
  const ipv4 = interfaces.find(
    (i) => i && i.family === 'IPv4' && !i.internal && !i.address.startsWith('127')
  )?.address;
  const ipv6 = interfaces.find((i) => i && i.family === 'IPv6' && !i.internal)?.address;

  app.listen(config.port, config.host, () => {
    console.log(`http://${config.host}:${config.port}`);
    console.log(`http://localhost:${config.port}`);
    if (ipv4) console.log(`http://${ipv4}:${config.port}`);
    if (ipv6) console.log(`http://[${ipv6}]:${config.port}`);
  });
}

if (require.main === module) {
  bootstrap();
}

export { app };
