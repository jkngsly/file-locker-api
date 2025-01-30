import { Module, Request } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from "./strategies/jwt.strategy" 
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy" 

import { UsersModule } from '@/users/users.module';
import { UsersService } from '@/users/users.service';
import { User } from '@/database/user.entity';
import { RequestContext } from 'src/common/request-context.service';
import { DriveModule } from '@/drive/drive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    DriveModule,
    PassportModule.register({ session: true }),
    JwtModule
  ],
  providers: [AuthService, UsersService, JwtStrategy, JwtRefreshStrategy, RequestContext],
  controllers: [AuthController]
})
export class AuthModule {}
