/**
 * Log levels (from lowest to highest)
 */
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Determines global log level
 * @returns LogLevel - defaults to DEBUG in dev, INFO in production
 * Can be overridden via VITE_LOG_LEVEL env variable (DEBUG|INFO|WARN|ERROR)
 */
const getGlobalLogLevel = (): LogLevel => {
  const envLogLevel = import.meta.env.VITE_LOG_LEVEL;
  if (envLogLevel) {
    switch (envLogLevel.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
    }
  }

  return import.meta.env.MODE === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
};

/**
 * Logger with context and log levels
 * 
 * @example
 * // In a class:
 * private logger = createLogger('MyService');
 * this.logger.info('Operation started', { data });
 * 
 * @example
 * // In a function:
 * const logger = createLogger('MyModule');
 * logger.error('Failed', error);
 */
class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string, minLevel?: LogLevel) {
    this.context = context;
    this.minLevel = minLevel ?? getGlobalLogLevel();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    
    console.log(prefix, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('DEBUG', message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('INFO', message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.formatMessage('WARN', message, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.formatMessage('ERROR', message, error, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('SUCCESS', message, ...args);
    }
  }
}

/**
 * Creates a new logger with the given context
 * @param context - Context name (e.g. 'AuthService', 'UserRepository')
 * @returns Logger instance
 */
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

export type { Logger };
export { LogLevel };

