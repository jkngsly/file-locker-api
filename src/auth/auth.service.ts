import { ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOne({ "email": email })

        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }

        if (!bcrypt.compare(user.password, password)) {
            throw new UnauthorizedException();
        } else {
            return this.getTokens(user.id, user.email)
        }
    }

    async verify(token: string) {
        const decoded = await this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET});
   
        return this.usersService.findOne({
            email: decoded.email
        })
    }

    async getTokens(userId: string, email: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: process.env.JWT_ACCESS_SECRET,
                    expiresIn: '5s',
                },
            ),

            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
            sub: userId
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findOne(userId);
        if (!user || !user.refresh_token)
            throw new ForbiddenException('Access Denied');

        const refreshTokenMatches = user.refresh_token ===  refreshToken

        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async updateRefreshToken(userId: string, refreshToken: string) { 
        this.usersService.update(userId, { refresh_token: refreshToken })
    }
}
