import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

/* Controllers */
import { DrivesController } from './drive.controller'
import { FoldersController } from './folders.controller'
import { FileController } from './file.controller'

/* Services */
import { DriveService } from './drive.service'
import { FoldersService } from './folders.service'
import { FilesService } from './files.service'

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