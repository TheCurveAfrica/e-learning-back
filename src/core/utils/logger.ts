import { createLogger, transports, format } from 'winston';
import jsonStringify from 'safe-json-stringify';
import settings from '../config/application';
import fs from 'fs';
import path from 'path';

const timestampDefinition = { format: 'YYYY-MM-DDTHH:mm:ss.SSS Z' };
const isProduction = settings.node_env === 'production';
const isTest = settings.node_env === 'test';

const logDir = 'logs';

// Create the logs folder only if not in production
if (!isProduction && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
console.log(isProduction);
console.log(isTest);
const loggerTransports = [];

if (!isProduction) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      silent: isTest
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      silent: isTest
    })
  );
}

// Always log to console (but format differently based on environment)
const customFormat = format.printf(({ level, message, timestamp, ...rest }): string => {
  const stringifiedRest = jsonStringify(rest);
  return `${timestamp} ${level}: ${message} ${stringifiedRest === '{}' ? '' : stringifiedRest}`;
});

loggerTransports.push(
  new transports.Console({
    format: format.combine(format.colorize(), format.timestamp(timestampDefinition), customFormat),
    silent: isTest
  })
);

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(timestampDefinition), format.json()),
  transports: loggerTransports
});

export { logger };
