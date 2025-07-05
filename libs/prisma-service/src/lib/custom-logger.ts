import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Injectable,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExtendedConsoleLogger extends ConsoleLogger {
  private logFile: string;
  private useJson: boolean;

  constructor(options: ConsoleLoggerOptions = {}) {
    super(options.context);
    this.logFile = path.join(process.cwd(), 'logs', 'application.log');
    this.useJson = options.json ?? false;

    // Ensure logs directory exists
    if (!fs.existsSync(path.dirname(this.logFile))) {
      fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }
  }

  private writeToFile(
    level: string,
    message: unknown,
    context?: string,
    stack?: string,
  ) {
    const timestamp = new Date().toISOString();

    const entry = this.useJson
      ? JSON.stringify({ timestamp, level, context, message, stack })
      : `[${timestamp}] [${level}] ${context || ''} ${this.stringify(message)} ${stack || ''}`;

    fs.appendFile(this.logFile, `${entry}\n`, (err) => {
      if (err) {
        super.error('Failed to write to log file', err);
      }
    });
  }

  log(message: unknown, context?: string): void {
    super.log(message, context);
    this.writeToFile('LOG', message, context);
  }

  error(message: unknown, stack?: string, context?: string): void {
    super.error(message, stack, context);
    this.writeToFile('ERROR', message, context, stack);
  }

  warn(message: unknown, context?: string): void {
    super.warn(message, context);
    this.writeToFile('WARN', message, context);
  }

  debug(message: unknown, context?: string): void {
    super.debug(message, context);
    this.writeToFile('DEBUG', message, context);
  }

  verbose(message: unknown, context?: string): void {
    super.verbose(message, context);
    this.writeToFile('VERBOSE', message, context);
  }

  private stringify(message: unknown): string {
    if (typeof message === 'object') {
      try {
        return JSON.stringify(message, null, 2);
      } catch {
        return '[Unserializable Object]';
      }
    }
    return String(message);
  }
}
