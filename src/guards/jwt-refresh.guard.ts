import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Optionally, you can add custom logic here to determine whether to activate the guard
    return super.canActivate(context);
  }
}