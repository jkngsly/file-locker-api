import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Standardize successful responses
        return {
          message: 'Request processed successfully',
          data: data || null,
          statusCode: context.switchToHttp().getResponse().statusCode,
          errors: [],
          errorMessage: '',
        };
      }),
      catchError((err) => {
        // Optionally handle and reformat errors here (or use Exception Filters)
        throw err; // Let the exception filter handle errors
      }),
    );
  }
}