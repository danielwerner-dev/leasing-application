import { createLogger, transports, format } from 'winston';

const DEBUG_ENVIRONMENTS = ['dev', 'qa'];

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

export type ErrorContext = {
  error?: Error;
  [key: string]: unknown;
};

const getLogLevel = () => {
  const allowDebug = DEBUG_ENVIRONMENTS.includes(process.env.ENVIRONMENT || '');
  const isDebugEnabled = process.env.DEBUG === 'true';

  return allowDebug && isDebugEnabled ? 'debug' : 'info';
};

const winstonLogger = createLogger({
  level: getLogLevel(),
  format: format.json(),
  transports: [new transports.Console()]
});

const log = (level: LogLevel, message: string, context: LogContext) => {
  winstonLogger.log(level, { message, context });
};

export const logger = {
  debug: (message: string, context: LogContext = {}) => {
    log('debug', message, context);
  },
  info: (message: string, context: LogContext = {}) => {
    log('info', message, context);
  },
  warn: (message: string, context: LogContext = {}) => {
    log('warn', message, context);
  },
  error: (message: string, context: ErrorContext = {}) => {
    log('error', message, context);
  }
};

export default logger;
