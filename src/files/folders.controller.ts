import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { UploadFilesDTO } from './dto/upload-files.dto'
import { DriveService } from './drive.service'
import Entry from './interfaces/entry.interface'
import { FileStorage, Visibility, DirectoryListing, StatEntry } from '@flystorage/file-storage';
import { Express } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createFolderDTO } from 'src/files/dto/create-folder.dto';
import { Folders } from 'src/database/folders.entity';

@Controller('folders')
export class FoldersController {
    constructor(private driveService: DriveService) { }

    @Get('get')
    async get(@Req() request: Request): Promise<Folders[]> {
       return this.driveService.getAllDirectories();
    }

    @Post('create')
    async create(@Body() dto: createFolderDTO): Promise<any> { 
        return this.driveService.createFolder(dto);
    }
}
