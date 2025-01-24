import { Controller, Get, Post, Body, Req, Query, UseInterceptors, UploadedFiles, StreamableFile, Param, Delete, Res } from '@nestjs/common'
import { UploadDTO } from '../dto/upload.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { FilesService } from 'src/drive/services/files.service'
import { FileSearchDTO } from '@/drive/dto/file-search.dto'

@Controller('file')
export class FileController {
    constructor(
        private filesService: FilesService
    ) { }

    @Get(':id')
    async getFile(@Param('id') id: string): Promise<Object> {
        return this.filesService.getById(id)
    }

    @Get(':id/download') 
    async readFile(@Param('id') id: string, @Res() res: Response): Promise<StreamableFile> { 
        const file = await this.filesService.download(id)
        return file.pipe(res)
    }

    @Delete(':id') 
    async delete(@Param('id') id: string): Promise<void> { 
        return this.filesService.delete(id)
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
        // TODO: res
    }

    
    @Post('search')
    async search(@Body() dto: FileSearchDTO): Promise<void> {
        const results = await this.filesService.search(dto)
        return results
    }
}
