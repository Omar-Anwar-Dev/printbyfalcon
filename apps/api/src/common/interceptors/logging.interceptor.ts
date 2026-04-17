import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * Logs one line per HTTP request with method, path, status, duration.
 * Health checks are suppressed to keep logs readable.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, originalUrl } = req;

    // Suppress health-check noise
    if (originalUrl?.startsWith('/api/v1/health')) {
      return next.handle();
    }

    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'log';
        this.logger[level](`${method} ${originalUrl} ${status} · ${duration}ms`);
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        const status = err?.status ?? 500;
        this.logger.error(`${method} ${originalUrl} ${status} · ${duration}ms · ${err?.message}`);
        throw err;
      }),
    );
  }
}
