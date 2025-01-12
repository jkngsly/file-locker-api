import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FoldersController } from './folders.controller'
import { DriveService } from './drive.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Files } from '../database/files.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Files])],
    controllers: [FilesController, FoldersController],
    providers: [DriveService],
    exports: [DriveService],
})
export class DriveModule {}