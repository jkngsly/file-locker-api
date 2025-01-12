import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';  // Correct way to import the naming strategy

config()

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
    entities: ['**/*.entity.ts'],
    //migrations: ['src/database/migrations/*-migration.ts'],
    migrationsRun: false,
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
})

export default AppDataSource