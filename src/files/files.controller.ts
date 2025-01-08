import { Controller, Get, Post, Body, Req } from '@nestjs/common'
import { CreateFileDto } from './dto/create-file.dto'
import { FilesService } from './files.service'
import { File } from './interfaces/file.interface'

@Controller('files')
export class FilesController { 
    constructor(private filesService: FilesService) {}

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
    async getUserFiles(@Req() request: Request): Promise<File[]> { 
        return this.filesService.readAllFromDirectory("public");
    }

    @Get()
    async getUserFiles2(@Req() request: Request): Promise<File[]> { 
        return this.filesService.readAllFromDirectory("public");
    }
}
