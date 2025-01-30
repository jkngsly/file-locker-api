import { MiddlewareConsumer, Module, RequestMethod, ValidationPipe} from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DriveModule } from './drive/drive.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'  // Correct way to import the naming strategy
import { Folder } from 'src/database/folder.entity'
import { Drive } from 'src/database/drive.entity'
import { HaidaFile } from 'src/database/haida-file.entity'
import { User } from 'src/database/user.entity'
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { JwtModule } from '@nestjs/jwt'
import { UsersService } from '@/users/users.service'
import { RequestContext } from 'src/common/request-context.service'
import { UserInterceptor } from 'src/common/user.interceptor'
import { UsersModule } from '@/users/users.module'

@Module({
  imports: [
    AuthModule,
    DriveModule,
    UsersModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    //TODO: BUG
    /* There is an issue when trying to use this for npm run migration vs importing to app.module.ts
    The migration/entity paths are relative from where it is being ran, updating one breaks the other.
    Currently they are duplicated */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_pASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Folder, Drive, HaidaFile, User],
      migrations: [__dirname + '/../database/migrations/*-migration.ts'],
      migrationsRun: false,
      synchronize: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestContext,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
  ],
  exports: [RequestContext]
})
export class AppModule { }
