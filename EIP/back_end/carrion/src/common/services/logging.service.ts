import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

export enum LogCategory {
  WEBHOOK = 'WEBHOOK',
  AUTH = 'AUTH',
  MAILFILTER = 'MAILFILTER',
  DATABASE = 'DATABASE',
  API = 'API',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  CRON = 'CRON',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class CustomLoggingService implements LoggerService {
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  log(message: string, category?: LogCategory, context?: LogContext) {
    this.writeLog('log', message, category, context);
  }

  error(
    message: string,
    trace?: string,
    category?: LogCategory,
    context?: LogContext,
  ) {
    this.writeLog('error', message, category, context, trace);
  }

  warn(message: string, category?: LogCategory, context?: LogContext) {
    this.writeLog('warn', message, category, context);
  }

  debug(message: string, category?: LogCategory, context?: LogContext) {
    if (this.isDevelopment) {
      this.writeLog('debug', message, category, context);
    }
  }

  verbose(message: string, category?: LogCategory, context?: LogContext) {
    if (this.isDevelopment) {
      this.writeLog('verbose', message, category, context);
    }
  }

  private writeLog(
    level: LogLevel,
    message: string,
    category?: LogCategory,
    context?: LogContext,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const categoryStr = category ? `[${category}]` : '';
    const contextStr = context ? `Context: ${JSON.stringify(context)}` : '';
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      category,
      message,
      context,
      ...(trace && { trace }),
    };

    if (this.isDevelopment) {
      // Colored console output for development
      const colorCode = this.getColorCode(level);
      console.log(
        `\x1b[${colorCode}m[${timestamp}] [${level.toUpperCase()}]${categoryStr} ${message}\x1b[0m`,
        contextStr ? `\n${contextStr}` : '',
        trace ? `\n${trace}` : '',
      );
    } else {
      // Structured JSON for production
      console.log(JSON.stringify(logEntry));
    }
  }

  private getColorCode(level: LogLevel): number {
    switch (level) {
      case 'error':
        return 31; // Red
      case 'warn':
        return 33; // Yellow
      case 'log':
        return 32; // Green
      case 'debug':
        return 36; // Cyan
      case 'verbose':
        return 35; // Magenta
      default:
        return 37; // White
    }
  }

  // Specialized methods for different contexts
  logWebhookEvent(event: string, data: any, context?: LogContext) {
    this.log(`Webhook event: ${event}`, LogCategory.WEBHOOK, {
      ...context,
      eventData: data,
    });
  }

  logEmailProcessing(
    action: string,
    emailData: {
      subject?: string;
      from?: string;
      messageId?: string;
    },
    context?: LogContext,
  ) {
    this.log(`Email processing: ${action}`, LogCategory.MAILFILTER, {
      ...context,
      ...emailData,
    });
  }

  logAuthEvent(event: string, userId?: string, context?: LogContext) {
    this.log(`Auth event: ${event}`, LogCategory.AUTH, {
      ...context,
      userId,
    });
  }

  logPerformance(operation: string, duration: number, context?: LogContext) {
    this.log(
      `Performance: ${operation} completed in ${duration}ms`,
      LogCategory.PERFORMANCE,
      {
        ...context,
        duration,
        operation,
      },
    );
  }

  logSecurityEvent(
    event: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    context?: LogContext,
  ) {
    const message = `Security event [${severity}]: ${event}`;
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      this.error(message, undefined, LogCategory.SECURITY, context);
    } else {
      this.warn(message, LogCategory.SECURITY, context);
    }
  }
}
