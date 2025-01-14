import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { UploadFilesDTO } from './dto/upload.dto'
import { DriveService } from './drive.service'
import Entry from './interfaces/entry.interface'
import { FileStorage, Visibility, DirectoryListing, StatEntry } from '@flystorage/file-storage';
import { Express } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createDriveDTO } from 'src/files/dto/create-drive.dto';

@Controller('drive')
export class DrivesController {
    constructor(private driveService: DriveService) { }

    @Post('create')
    async create(@Body() dto: createDriveDTO): Promise<any> { 
        return this.driveService.createDrive(dto);
    }
}
