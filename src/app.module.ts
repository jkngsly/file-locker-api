import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DriveModule } from './drive/drive.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import AppDataSource from './config/typeorm.config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';  // Correct way to import the naming strategy
import { Folders } from 'src/database/folder.entity';
import { Drives } from 'src/database/drive.entity';
import { Files } from 'src/database/files.entity'
import { Users } from 'src/database/user.entity'

@Module({
  imports: [
    DriveModule,
    ConfigModule.forRoot(),

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
      entities: [Folders, Drives, Files, Users],
      migrations: [__dirname + '/../database/migrations/*-migration.ts'],
      migrationsRun: false,
      synchronize: false,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
