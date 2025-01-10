import { Controller, Get, Post, Body, Req, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { UploadFilesDTO } from './dto/upload-files.dto'
import { FilesService } from './files.service'
import Entry from './interfaces/entry.interface'
import { FileStorage, Visibility, DirectoryListing, StatEntry } from '@flystorage/file-storage';
import { Express } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) { }

    /*
    @Post()
    async create(@Body() createFileDto: CreateFileDto) { 
        this.filesService.create(createFileDto);
    }*/

    /*
@Get()
async findAll(): Promise<File[]> {
    return this.filesService.findAll();
}*/

    @Get('get-user-files')
    async getUserFiles(@Req() request: Request): Promise<Entry[]> {
        return this.filesService.getDirectory();
    }

    @Post('upload')
    // TODO: Max file count setting
    @UseInterceptors(
        FilesInterceptor('files[]', 10, {
            storage: diskStorage({
                destination: 'tmp',
                filename: (req, file, cb) => {
                    // Generate a unique filename here
                    cb(null, `${Date.now()}-${file.originalname}`);
                },
            }),
        }),
    )
    async uploadFiles(@Body() createFileDto: UploadFilesDTO, @UploadedFiles() files: Array<Express.Multer.File>): Promise<void> {
        await this.filesService.upload(files, createFileDto.directory);
    }
}
