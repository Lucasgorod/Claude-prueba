export type LogLevel = 'debug' | 'error' | 'none';

class Logger {
  private level: LogLevel;

  constructor() {
    const envLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || undefined;
    if (envLevel) {
      this.level = envLevel;
    } else {
      this.level = import.meta.env.DEV ? 'debug' : 'error';
    }
  }

  private shouldLog(msgLevel: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { none: 0, error: 1, debug: 2 };
    return levels[msgLevel] <= levels[this.level];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  }
}

export const logger = new Logger();
