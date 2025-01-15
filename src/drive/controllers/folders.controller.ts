import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles, Param } from '@nestjs/common'
import { FilesService } from '../services/files.service'
import { createFolderDTO } from 'src/drive/dto/create-folder.dto';
import { GetFoldersDTO } from 'src/drive/dto/get-folders.dto';
import { Folder } from 'src/database/folder.entity';
import { HaidaFile } from 'src/database/haida-file.entity';
import { FoldersService } from 'src/drive/services/folders.service';

@Controller('folders')
export class FoldersController {
    constructor(
        private foldersService: FoldersService,
        private filesService: FilesService
    ) { }

    @Get('')
    async get(): Promise<Folder[]> {
        return this.foldersService.getTree();
    }

    @Get(':id/files')
    async getFolderFiles(@Param() query: GetFoldersDTO): Promise<HaidaFile[]> {
        // TODO: validate user ownership/access to folder
        // TODO: get business logic out of controller
        // TODO: use pipe transform request/resp and account for root folder (no id)
        // @ts-ignore
        return this.filesService.getByFolderId(query.id == "root" ? undefined : query.id);
    }

    @Post('create')
    async create(@Body() dto: createFolderDTO): Promise<any> { // TODO: promise return type
        return this.foldersService.create(dto);
    }
}
