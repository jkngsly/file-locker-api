import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    jwtService: any;
    constructor(private usersService: UsersService) {}

    async signIn(email: string, password: string): Promise<any> { 
        const user = await this.usersService.findOne({"email": email})

        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }

        if (!bcrypt.compare(user.password, password)) {
            throw new UnauthorizedException();
        } else { 
            return {
                access_token: await this.jwtService.signAsync({ sub: user.id, username: user.email }),
            };
        }
    }
}
 