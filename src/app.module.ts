import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DriveModule } from './files/drive.module'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    DriveModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 5432),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_pASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/database/core/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
