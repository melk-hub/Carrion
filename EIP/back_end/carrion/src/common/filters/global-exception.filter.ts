import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Log the full error for debugging
    this.logger.error(
      `Exception caught: ${JSON.stringify({
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        exception: exception instanceof Error ? exception.message : exception,
        stack: exception instanceof Error ? exception.stack : undefined,
      })}`,
    );

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || message;
        error = (responseBody as any).error || error;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma specific errors
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      switch (exception.code) {
        case 'P2002':
          message = 'A unique constraint violation occurred';
          break;
        case 'P2025':
          message = 'Record not found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          break;
        case 'P2014':
          message = 'Invalid relation data provided';
          break;
        default:
          message = 'Database operation failed';
      }
    } else if (exception instanceof Error) {
      // Handle generic errors
      message = exception.message;
      error = exception.name;
      // Check for specific error patterns
      if (message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
      } else if (message.includes('already exists')) {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';
      } else if (message.includes('validation')) {
        status = HttpStatus.BAD_REQUEST;
        error = 'Validation Error';
      }
    }

    // Ensure we don't expose sensitive information in production
    if (
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    });
  }
}
