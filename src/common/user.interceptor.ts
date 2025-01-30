import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RequestContext } from './request-context.service';
import { Observable } from 'rxjs';
import { UsersService } from '@/users/users.service';

/**
 * Retrieves the User based on the JSON Web Token and makes it available in the RequestContext service 
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(

    private readonly requestContext: RequestContext,

    private readonly userService: UsersService, // Inject UserService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      this.requestContext.setUser(await this.userService.findOne({ id: request.user.userId }))
    }

    return next.handle();
  }
}