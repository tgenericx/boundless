import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Injectable,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExtendedConsoleLogger extends ConsoleLogger {
  private readonly useJson: boolean;
  private readonly baseDir = path.join(process.cwd(), 'logs');

  constructor(options: ConsoleLoggerOptions = {}) {
    super(options.context);
    this.useJson = options.json ?? false;

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getLogFilePath(level: string, context?: string): string {
    const safeContext =
      context?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const dirPath = path.join(this.baseDir, safeContext);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    return path.join(dirPath, `${level.toLowerCase()}.log`);
  }

  private writeToFile(
    level: string,
    message: unknown,
    context?: string,
    stack?: string
  ) {
    const timestamp = new Date().toISOString();
    const entry = this.useJson
      ? JSON.stringify({ timestamp, level, context, message, stack })
      : `[${timestamp}] [${level}] ${context || ''} ${this.stringify(
          message
        )} ${stack || ''}`;

    const filePath = this.getLogFilePath(level, context);

    fs.appendFile(filePath, `${entry}\n`, (err) => {
      if (err) {
        super.error('Failed to write to log file', err);
      }
    });
  }

  log(message: unknown, context?: string): void {
    super.log(message, context);
    this.writeToFile('INFO', message, context);
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
