import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { RequestContext } from './request-context.service';
  import { Observable } from 'rxjs';
import { User } from '@/database/user.entity';
import { UsersService } from '@/users/users.service';

  @Injectable()
  export class UserInterceptor implements NestInterceptor {
    constructor(
        
        private readonly requestContext: RequestContext,
        
        private readonly userService: UsersService, // Inject UserService
    ) {}
  
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>  {
      const request = context.switchToHttp().getRequest();
      if (request.user) {
        console.log(this.requestContext, "request.originalUrl")
        this.requestContext.setUser(await this.userService.findOne({ id: request.user.userId }))
      }
      
      return next.handle();
    }
  }