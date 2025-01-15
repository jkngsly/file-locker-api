import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { DriveService } from '../services/drive.service'
import { createDriveDTO } from 'src/drive/dto/create-drive.dto'

@Controller('drive')
export class DrivesController {
    constructor(private driveService: DriveService) { }
/*
    @Post('create')
    async create(@Body() dto: createDriveDTO): Promise<any> { 
        return this.driveService.createDrive(dto);
    }*/
}
