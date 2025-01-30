import { User } from '@/database/user.entity';
import { Injectable, Scope } from '@nestjs/common';

@Injectable()
export class RequestContext {
  private user: User;

  setUser(user: User) {
    this.user = user;
    console.log(this.user, "setUser")
  }

  getUser(): User {
    console.log(this.user, "getUser")
    return this.user;
  }
}