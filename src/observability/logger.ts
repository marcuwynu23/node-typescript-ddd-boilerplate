import pino from 'pino';

export function createLogger() {
  const level =
    process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info');

  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(isProduction || isTest
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: true,
            },
          },
        }),
  });
}

