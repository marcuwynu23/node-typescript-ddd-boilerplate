import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isTest = nodeEnv === 'test';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

export const config = {
  nodeEnv,
  isTest,
  isProduction,
  isDevelopment,
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 5000),
  logLevel: process.env.LOG_LEVEL ?? (isTest ? 'silent' : 'info'),
  opentelemetryUrl: process.env.OPENTELEMETRY_URL ?? 'http://localhost:4317',
  scalarEnabled: process.env.SCALAR_ENABLED === 'true',
  openAPISpecPath: process.env.OPEN_API_SPEC_PATH ?? '.',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/greetings',
} as const;

// Print only config variables
console.log('\n=== Configuration Variables ===');
console.table(config);

export type Config = typeof config;
