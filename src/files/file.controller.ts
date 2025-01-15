import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles, StreamableFile, Param } from '@nestjs/common'
import { UploadDTO } from './dto/upload.dto'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from 'src/files/files.service';

@Controller('file')
export class FileController {
    constructor(
        private filesService: FilesService
    ) { }

    @Get(':id')
    async getFile(@Param('id') id: string)
        : Promise<Object> {
        return this.filesService.getById(id)
    }

    @Get('download') 
    async readFile(@Query('id') id: string) : Promise<StreamableFile> { 
        return this.filesService.download(id)
    }

    @Post('upload')
    @UseInterceptors(
        // TODO: Max file count config
        FilesInterceptor('files[]', 10, {
            storage: diskStorage({
                destination: 'tmp',
                filename: (req, file, cb) => {
                    // Generate a unique filename here
                    cb(null, `${Date.now()}-${file.originalname}`)
                },
            }),
        }),
    )
    async upload(@Body() dto: UploadDTO, @UploadedFiles() files: Array<Express.Multer.File>): Promise<void> {
        await this.filesService.upload(files, dto.folderId)
    }
}
