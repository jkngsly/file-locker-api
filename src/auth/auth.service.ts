import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { User } from '@/database/user.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AuthService {
    user: User

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { 
        
    }

    async login(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOne({ "email": email })

        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }

        if (!bcrypt.compare(user.password, password)) {
            throw new UnauthorizedException();
        } else {
            const tokens = await this.getTokens(user.id, user.email)
            await this.updateRefreshToken(user.id, tokens.refreshToken)
            return tokens
        }
    }

    async verify(token: string) {
        const decoded = await this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET});
   
        return this.usersService.findOne({
            email: decoded.email
        })
    }

    private async _generateToken(payload, refresh: boolean = false) { 
        const tokenType = refresh ? "REFRESH" : "ACCESS"
        console.log({
            secret: process.env["JWT_" + tokenType + "_SECRET"],
            expiresIn: process.env["JWT_" + tokenType + "_EXPIRE"]})
        return this.jwtService.signAsync(
            payload, {
                secret: process.env["JWT_" + tokenType + "_SECRET"],
                expiresIn: process.env["JWT_" + tokenType + "_EXPIRE"]
            }
        )
    }

    async getTokens(userId: string, email: string) {
        const payload = { sub: userId, email }
        const [accessToken, refreshToken] = await Promise.all([
            await this._generateToken(payload),
            await this._generateToken(payload, true)
        ]);

        return {
            accessToken,
            refreshToken,
            sub: userId
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findOne({ id: userId });
        if (!user || !user.refresh_token)
            throw new ForbiddenException('Access Denied');

        const refreshTokenMatches = user.refresh_token ===  refreshToken

        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async updateRefreshToken(userId: string, refreshToken: string) { 
        const result = await this.usersService.update({ id: userId, refresh_token: refreshToken })
        return result
    }
}
