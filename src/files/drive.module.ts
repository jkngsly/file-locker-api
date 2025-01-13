import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FoldersController } from './folders.controller'
import { DrivesController } from './drive.controller'
import { DriveService } from './drive.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Files } from '../database/files.entity'
import { Drives } from '../database/drive.entity'
import { Folders } from '../database/folders.entity'
import { Users } from '../database/users.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Files, Drives, Folders, Users])],
    controllers: [DrivesController, FilesController, FoldersController],
    providers: [DriveService],
    exports: [DriveService],
})
export class DriveModule {}