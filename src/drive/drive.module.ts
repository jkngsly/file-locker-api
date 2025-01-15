import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

/* Controllers */
import { DrivesController } from './controllers/drive.controller'
import { FoldersController } from './controllers/folders.controller'
import { FileController } from './controllers/file.controller'

/* Services */
import { DriveService } from './services/drive.service'
import { FoldersService } from './services/folders.service'
import { FilesService } from './services/files.service'

/* Entities */
import { Drive } from '../database/drive.entity'
import { Folder } from '../database/folder.entity'
import { HaidaFile } from '../database/haida-file.entity'
import { User } from '../database/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([HaidaFile, Drive, Folder, User])],
    controllers: [DrivesController, FileController, FoldersController],
    providers: [DriveService, FoldersService, FilesService],
    exports: [DriveService, FoldersService, FilesService],
})
export class DriveModule {}