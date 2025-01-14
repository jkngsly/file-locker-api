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
import { GetFoldersDTO } from 'src/files/dto/get-folders.dto';

@Controller('folders')
export class FoldersController {
    constructor(private driveService: DriveService) { }

    @Get('/')
    async get(@Query() query: GetFoldersDTO) {
        return this.driveService.getFolders(query.id);
    }

    @Post('create')
    async create(@Body() dto: createFolderDTO): Promise<any> { 
        return this.driveService.createFolder(dto);
    }
}
