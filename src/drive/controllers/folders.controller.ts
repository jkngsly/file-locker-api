import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { DriveService } from '../services/drive.service'
import { createFolderDTO } from 'src/drive/dto/create-folder.dto';
import { GetFoldersDTO } from 'src/drive/dto/get-folders.dto';
import { Folder } from 'src/database/folder.entity';
import { HaidaFile } from 'src/database/haida-file.entity';

@Controller('folders')
export class FoldersController {
    constructor(private driveService: DriveService) { }

    @Get('')
    async get(@Query() query: GetFoldersDTO): Promise<Folder[]> {
        return this.driveService.getFolders(query.id);
    }

    @Get(':id/files')
    async getFolderFiles(@Query() query: GetFoldersDTO): Promise<HaidaFile[]> {
        return this.driveService.getFolders(query.id);
    }

    @Post('create')
    async create(@Body() dto: createFolderDTO): Promise<any> { // TODO: promise return type
        return this.driveService.createFolder(dto);
    }
}
