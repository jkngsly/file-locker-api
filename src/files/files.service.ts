import session from "express-session";
import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { createReadStream } from "fs";
import { join } from "path";

import { HaidaFile } from "src/database/haida-file.entity";
import { UploadDTO } from "src/files/dto/upload.dto";
import { Folder } from "src/database/folder.entity";
import { DriveService } from "src/files/drive.service";

interface FileQueryInterface {
    id?: string
    //name?: string
}

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(HaidaFile)
        private filesRepository: Repository<HaidaFile>,
        private driveService: DriveService,
        private readonly dataSource: DataSource
    ) { }

    private async _get(query: FileQueryInterface, relations?: string[]): Promise<HaidaFile> {
        const find = { 
            where: { ...query },
            relations: [...relations]
        }
        return await this.filesRepository.findOne(find)
    }

    async getById(id: string): Promise<HaidaFile> {
        return this._get({
            id: id
        })
    }

    async download(id: string): Promise<StreamableFile> {
        const haidaFile: HaidaFile = await this.getById(id)
        // @ts-ignore
        const path = 'drive/' + session.userId + '/' + haidaFile.path;
        return new StreamableFile(createReadStream(join(process.cwd(), path)), {
            type: 'application/json',
            // @ts-ignore
            disposition: 'attachment; filename="' + haidaFile.name + '"',
        })
    }

    async upload(files: Array<Express.Multer.File>, dto: UploadDTO) {
        files.forEach((file: Express.Multer.File) => {
            this.driveService.createFile(file, dto.folderId);
/*
        let parentFolder: Folder | undefined = undefined
        let path = ""

        const entityManager = this.dataSource.manager

        if (!dto.folderId) {
            parentFolder = await this.getRootFolder()
        } else {
            // Fetch the parent folder
            parentFolder = await entityManager.findOne(Folder, {
                where: { id: dto.folderId },
            });
        }
        if (!parentFolder) {
            throw new Error('Parent folder not found');
        }

        // Construct the path based on the parent folder's path
        path += `${parentFolder.path}`
      

        files.forEach((file: Express.Multer.File) => {
            /*
            const filePath = path + "/" + file.originalname;

            this.driveService.write(file, filePath)
                .then(() => {
                    // Remove the file from /tmp
                    unlink(file.path, (err) => {
                        if (err) throw err
                    })

                    return this.filesRepository.save({
                        folder: parentFolder,
                        name: file.originalname,
                        path: filePath,
                        is_media: false,
                        mime_type: file.mimetype
                    })
                })
           
        }) */
    }

}