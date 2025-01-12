import { DataSource } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'
config()

const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

const configService = new ConfigService()

const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATBASE_HOST'),
    port: parseInt(configService.get<string>('DATABASE_PORT')),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PAsSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    synchronize: false,
    entities: ['**/*.entity.ts'],
    migrations: ['src/database/migrations/*-migration.ts'],
    migrationsRun: false,
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
})

export default AppDataSource