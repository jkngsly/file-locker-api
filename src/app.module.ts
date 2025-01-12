import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DriveModule } from './files/drive.module'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';  // Correct way to import the naming strategy

@Module({
  imports: [
    DriveModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_pASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/database/core/**/*.entity{.ts,.js}'],
      //migrations: ['src/database/migrations/*-migration.ts'],
      //migrationsRun: false,
      logging: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
