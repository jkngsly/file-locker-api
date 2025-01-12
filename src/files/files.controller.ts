import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { UploadFilesDTO } from './dto/upload-files.dto'
import { DriveService } from './drive.service'
import Entry from './interfaces/entry.interface'
import { FileStorage, Visibility, DirectoryListing, StatEntry } from '@flystorage/file-storage';
import { Express } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
    constructor(private driveService: DriveService) { }

    @Get('get')
    async getFiles(
        @Req() request: Request,
        @Query('path') path: string = "")
        : Promise<Entry[]> {
        return this.driveService.get(path);
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
    async upload(@Body() dto: UploadFilesDTO, @UploadedFiles() files: Array<Express.Multer.File>): Promise<void> {
        await this.driveService.upload(files, dto);
    }
}
