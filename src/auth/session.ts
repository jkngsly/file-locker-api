import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '@/database/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error, user: any) => void) {
    done(null, user.id); // Serialize the user ID
  }

  deserializeUser(id: number, done: (err: Error, user: any) => void) {
    // Fetch the user from the database based on the ID
    // Inject your user repository here 
    // ...
    // done(null, user);
  }
}