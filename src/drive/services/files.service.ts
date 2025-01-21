import session from "express-session"
import { Inject, Injectable, StreamableFile } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { REQUEST } from "@nestjs/core"
import { DataSource, Repository } from "typeorm"
import * as fs from 'fs'
import { join, resolve } from "path"

import { FileStorage, UnableToCheckFileExistence, UnableToWriteFile } from "@flystorage/file-storage"
import { LocalStorageAdapter } from "@flystorage/local-fs"

import { HaidaFile } from "@/database/haida-file.entity"
import { Folder } from "@/database/folder.entity"
import { Drive } from "@/database/drive.entity"

import { UploadDTO } from "src/drive/dto/upload.dto"
import { DriveService } from "src/drive/services/drive.service"
import { BaseService } from "src/drive/services/base.service"
import { time } from "console"

interface FileQueryInterface {
    id?: string
    folder_id?: string
}

@Injectable()
export class FilesService extends BaseService {
    constructor(
        @InjectRepository(Folder)
        protected readonly foldersRepository: Repository<Folder>,
        
        @InjectRepository(Drive)
        protected readonly driveRepository: Repository<Drive>,

        @InjectRepository(HaidaFile)
        private filesRepository: Repository<HaidaFile>,

        @Inject(REQUEST)
        protected readonly request: Request,

        @Inject(FileStorage)
        protected storage: FileStorage,
    ) { 
        super(foldersRepository, driveRepository, request, storage)
    }

    private  _getExtension(path: string): string|false { 
        const match = path.match(/[^.]+$/) // Matches everything after the last dot
        return match ? "." + match[0] : false 
    }

    private async _getDuplicateRename(path: string): Promise<string> { 
        const extension = this._getExtension(path);
        if(extension !== false) { 
            path = path.replace(extension, '');
        }

        let rename = "";
        let i = 1;
        while(rename === "") { 
            const newPath = path + ` (${i})` + // document (1)
            (extension !== false ? `.${extension}` : ``) // .txt

            if(!this._exists(newPath))
                rename = newPath
            else 
                i++;
        }

        return rename
    }

    /**
     * Checks if a file path exists using FlyStorage API's fileExists(path) 
     * 
     * @param path The full file path (Example: path/to/file.txt)
     * @returns {Promise<boolean>} Returns a Promise boolean
     */
    private async _exists(path: string): Promise<boolean> { 
        try { 
            return this.storage.fileExists(path)
        } catch(e) { 
            if (e instanceof UnableToCheckFileExistence) {
                // handle error
            }
        }
    }

    
    /**
     * Executes a repository findOne method 
     * 
     * @param where The where object in repository's findOne method (Example: { path: "path/to/file.txt"})
     * @returns {Promise<HaidaFile>|Promise<null>} Promise containing either the HaidaFile or null
     */
    private async _find(where: FileQueryInterface, relations?: string[]): Promise<HaidaFile> {
        const find = { 
            where: { ...where }
        }
        return await this.filesRepository.findOne(find)
    }

    
    /**
     * Executes a repository find method  
     * 
     * @param where The where object in repository's find method (Example: { path: "path/to/file.txt"})
     * @returns {Promise<HaidaFile[]>|Promise<null>} Promise containing either the HaidaFile collection or null
     */
    private async _get(where: FileQueryInterface, relations?: string[]): Promise<HaidaFile[]> {
        const find = { 
            where: { ...where }
        }
        return await this.filesRepository.find(find)
    }

    /**
     * Writes Multer file's contents in the /tmp folder to the storage adapter using the provided path. If a duplicate path exists, it will be renamed according to FilesService._getDuplicateRename()
     * 
     * @param file The Express Multer File object provided by FilesInterceptor middleware
     * @param path The full file path (Example: "path/to/file.txt")
     * @returns Returns a truthy boolean
     */
    private async _write(file: Express.Multer.File, path: string): Promise<true> {
        try {
            const contents = fs.createReadStream(file.path)

            this._initStorageAdapter();

            // Check for duplicates
            if(this._exists(path)) { 
                path += Date.now()
            }

            this.storage.write(path, contents)
            return true
        } catch (err) {
            if (err instanceof UnableToWriteFile) {
                console.log(err)
            }
        }
    }

    /**
    * Saves a HaidaFile to the database
    *
    * @param file The Express Multer File object provided by FilesInterceptor middleware
    * @param folder The parent Folder Object of the HaidaFile
    * @returns //TODO 
    */
    private _save(file: Express.Multer.File, folder: Folder): Promise<any> { 
        return this.filesRepository.save({
            folder: folder,
            name: file.originalname,
            path: folder.path + "/" + file.originalname,
            is_media: this._isMedia(file),
            mime_type: file.mimetype
        })
    }

    /**
    * Determines if a file's mime_type matches a given set of common audio/video types (mpeg, wav, ogg, mp3, webm, aac, mp4, ogg, webm, avi, and mkv)
    *
    * @param file The Express Multer File object provided by FilesInterceptor middleware
    * @param folder The parent Folder Object of the HaidaFile
    * @returns {boolean} True or false
    */
    private _isMedia(file: Express.Multer.File): boolean { 
        // Define arrays of audio and video MIME types
        // TODO: remove hardcode, database of known media types [support for]
        const audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm', 'audio/aac']
        const videoMimeTypes = ['video/mp4', 'video/ogg', 'video/webm', 'video/avi', 'video/mkv']

        // Check if the file's MIME type is in either the audio or video lists
        return audioMimeTypes.includes(file.mimetype) || videoMimeTypes.includes(file.mimetype)
    }

    async getById(id: string): Promise<HaidaFile> {
        return this._find({
            id: id
        })
    }

    async getByFolderId(folderId?: string): Promise<HaidaFile[]> {
            
        return await this._get({
            folder_id: folderId
        })
    }

    async download(id: string): Promise<StreamableFile> {
        const haidaFile: HaidaFile = await this.getById(id)
        // @ts-ignore // TODO: session object
        const path = 'drive/' + this.request.session.defaultData['userId'] + '/' + haidaFile.path
        return new StreamableFile(fs.createReadStream(join(process.cwd(), path)), {
            type: 'application/json',
            // @ts-ignore
            disposition: 'attachment filename="' + haidaFile.name + '"',
        })
    }

    async upload(files: Array<Express.Multer.File>, folderId: string) {
        let folder = undefined
            
        if(!folderId || folderId == "root") { 
            folder = await this._getRootFolder()
        } else {
            // Validate the folder ID belongs to the user 
            // @ts-ignore // TODO: session object
            folder = await this.dateSource.manager.findOne(Folder, { where: { user_id: this.request.session.defaultData['userId'], id: folderId }})
        }

        if(!folder) {
            throw new Error('Folder not found')
        }

        files.forEach(async (file: Express.Multer.File) => {

            let path = folder.path + file.originalname;

            if(await this._exists(path))
                path = await this._getDuplicateRename(path)

            this._write(file, path)
            .then(() => {
                // Remove the file from /tmp
                fs.unlink(file.path, (err) => {
                    if (err) throw err
                })
                
                // Save to database
                this._save(file, folder)
            })
        })
    }
}