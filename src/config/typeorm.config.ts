import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';  // Correct way to import the naming strategy
import { Folder } from 'src/database/folder.entity';
import { Drives } from 'src/database/drive.entity';
import { HaidaFile } from 'src/database/haida-file.entity'
import { User } from 'src/database/user.entity'

config()

//TODO: BUG
/* There is an issue when trying to use this for npm run migration vs importing to app.module.ts
The migration/entity paths are relative from where it is being ran, updating one breaks the other.
Currently they are duplicated */
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_pASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [Folder, Drives, HaidaFile, User],
    migrations: ['src/database/migrations/*-migration.ts'],
    migrationsRun: false,
    synchronize: false,
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
})

export default AppDataSource