import session from "express-session";
import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as fs from 'fs'
import { join, resolve } from "path";

import { HaidaFile } from "src/database/haida-file.entity";
import { UploadDTO } from "src/drive/dto/upload.dto";
import { Folder } from "src/database/folder.entity";
import { DriveService } from "src/drive/services/drive.service";
import { FileStorage, UnableToWriteFile } from "@flystorage/file-storage";
import { LocalStorageAdapter } from "@flystorage/local-fs";
import { Drive } from "src/database/drive.entity";

interface FileQueryInterface {
    id?: string
    //name?: string
}

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(HaidaFile)
        private filesRepository: Repository<HaidaFile>,
        private driveRepository: Repository<Drive>,
        private driveService: DriveService,
        private readonly dataSource: DataSource
    ) { }

    private async _getDrive(): Promise<Drive> { 
        const drive = await this.driveRepository.findOne({
            // @ts-ignore // TODO: session object
            where: { user_id: session.userId }
        });

        if (!drive) {
            throw new Error('Drive not found');
        }

        return drive;
    }

    private async _getRootFolder(): Promise<Folder> {
        const drive: Drive = await this._getDrive(); 
        // Fetch the parent folder
        return await this.dataSource.manager.findOne(Folder, {
            where: { drive_id: drive.id, is_root: true },
        });
    }


    private async _get(query: FileQueryInterface, relations?: string[]): Promise<HaidaFile> {
        const find = { 
            where: { ...query },
            relations: [...relations]
        }
        return await this.filesRepository.findOne(find)
    }

    private async _write(file: Express.Multer.File, path: string): Promise<boolean> {
        try {
            // TODO: Check for duplicates
            const content = fs.createReadStream(file.path)

            // TODO: SEPARATE 
            // @ts-ignore // TODO: session object
            let rootDirectory: string = resolve(process.cwd(), 'drive/' + session.userId)
            let fileStorage = new FileStorage(new LocalStorageAdapter(rootDirectory))

            await fileStorage.write(path, content)
            return true
        } catch (err) {
            if (err instanceof UnableToWriteFile) {
                console.log(err)
            }
        }
    }

    private _save(file: Express.Multer.File, folder: Folder) { 
        return this.filesRepository.save({
            folder: folder,
            name: file.originalname,
            path: folder.path + "/" + file.originalname,
            is_media: this._isMedia(file),
            mime_type: file.mimetype
        })
    }

    private _isMedia(file: Express.Multer.File): boolean { 
        // Define arrays of audio and video MIME types
        const audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm', 'audio/aac'];
        const videoMimeTypes = ['video/mp4', 'video/ogg', 'video/webm', 'video/avi', 'video/mkv'];

        // Check if the file's MIME type is in either the audio or video lists
        return audioMimeTypes.includes(file.mimetype) || videoMimeTypes.includes(file.mimetype);
    }

    async getById(id: string): Promise<HaidaFile> {
        return this._get({
            id: id
        })
    }

    async download(id: string): Promise<StreamableFile> {
        const haidaFile: HaidaFile = await this.getById(id)
        // @ts-ignore // TODO: session object
        const path = 'drive/' + session.userId + '/' + haidaFile.path;
        return new StreamableFile(fs.createReadStream(join(process.cwd(), path)), {
            type: 'application/json',
            // @ts-ignore
            disposition: 'attachment; filename="' + haidaFile.name + '"',
        })
    }

    async upload(files: Array<Express.Multer.File>, folderId: string) {
        let folder = undefined

        if(!folderId || folderId == "root") { 
            folder = await this._getRootFolder();
        } else {
            // Validate the folder ID belongs to the user 
            // @ts-ignore // TODO: session object
            folder = await this.dateSource.manager.findOne(Folder, { where: { user_id: session.userId, id: folderId }})
        }

        if(!folder) {
            throw new Error('Folder not found');
        }

        files.forEach((file: Express.Multer.File) => {
            this._write(file, folder.path)
            .then(() => {
                // Remove the file from /tmp
                fs.unlink(file.path, (err) => {
                    if (err) throw err
                })
                
                // Save to database
                this._save(file, folder);
            })
        })
    }
}