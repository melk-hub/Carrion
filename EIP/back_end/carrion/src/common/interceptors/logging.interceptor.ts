import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `${method} ${url} - User: ${userId} - Duration: ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        this.logger.error(
          `${method} ${url} - User: ${userId} - Duration: ${duration}ms - Error: ${error.message}`,
        );
        return throwError(error);
      }),
    );
  }
}
