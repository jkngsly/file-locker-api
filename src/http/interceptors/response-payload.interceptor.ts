import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
          return {
            message: 'Request processed successfully',
            data: data || null,
            statusCode: context.switchToHttp().getResponse().statusCode,
            errors: [],
            errorMessage: '',
          };
      })
    );
  }
}