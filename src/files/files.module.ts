import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Files } from '../database/files.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Files])],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule {}