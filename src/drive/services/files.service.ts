import session from "express-session"
import { Inject, Injectable, StreamableFile } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { REQUEST } from "@nestjs/core"
import { DataSource, Like, Repository } from "typeorm"
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
import { FileSearchDTO } from "@/drive/dto/file-search.dto"
import { RequestContext } from "src/common/request-context.service"
import { FoldersService } from "@/drive/services/folders.service"

interface FileQueryInterface {
    id?: string
    folder_id?: string
}

@Injectable()
export class FilesService extends BaseService {

    constructor(
        protected readonly requestContext: RequestContext,

        @InjectRepository(Folder)
        protected readonly foldersRepository: Repository<Folder>,
        
        protected readonly foldersService: FoldersService,
                
        @InjectRepository(HaidaFile)
        private filesRepository: Repository<HaidaFile>,

        private fileStorage: FileStorage
    ) { 
        super(requestContext, foldersRepository)
    }

    // Sets the working directory for the FileStorage adapter
    private async _setStorageDirectory(drive: Drive) { 
        this.fileStorage = await this._initStorageAdapter(process.env.LOCAL_STORAGE_PATH + `/${drive.id}`)
    }

    private  _getExtension(filename: string): string|false { 
        const match = filename.match(/[^.]+$/) // Matches everything after the last dot
        return match ? "." + match[0] : false 
    }

    private async _getDuplicateRename(filename: string, path: string): Promise<string> { 
        const extension = this._getExtension(filename);
        if(extension !== false) { 
            filename = filename.replace(extension, '');
        }

        let rename = "";
        let i = 1;
        while(rename === "") { 
            const newName = filename + ` (${i})` + // document (1)
            (extension !== false ? `.${extension}` : ``) // .txt

            if(!await this._exists(path + "/" + newName))
                rename = newName
            else 
                i++;
        }

        return rename
    }

    /**
     * Checks if a file path exists using FlyStorage API's fileExists(path) 
     * 
     * @param path The full file path (Example: path/to/file.txt)
     * @throws {UnableToCheckFileExistence}
     * @returns {Promise<boolean>} Returns a Promise boolean
     */
    private async _exists(path: string): Promise<boolean> { 
        try { 
            return this.fileStorage.fileExists(path)
        } catch(e) { 
            if (e instanceof UnableToCheckFileExistence) {
                console.log("ERROR", e)
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
     * Writes Multer file's contents in the /tmp folder to the storage adapter using the provided path. 
     * 
     * @param file The Express Multer File object provided by FilesInterceptor middleware
     * @param path The full file path (Example: "path/to/file.txt")
     * @throws {UnableToWriteFile}
     * @returns Returns a void Promise
     */
    private async _write(file: Express.Multer.File, path: string): Promise<void> {
        console.log("_write")
        try {
            const contents = fs.createReadStream(file.path)
            return this.fileStorage.write(path, contents)
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
    private _save(file: Object): Promise<any> { 
        return this.filesRepository.save(file)
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

    async download(id: string): Promise<any> {//Promise<StreamableFile> {
        const haidaFile: HaidaFile = await this.getById(id)
        const folder: Folder = await this.foldersService.findOne({id: haidaFile.folder_id })

        // @ts-ignore // TODO: session object
        return fs.createReadStream(await this._getDrivePath(folder.drive.id) + "/" + haidaFile.path)
    }

    async delete(id: string) { 
        const file = await this._find({ id: id });

        if (!file) {
            throw new Error('File not found');
        }

        file.deleted_at = new Date(); // Set the deletedAt field to current timestamp
        await this.filesRepository.save(file);
    }

    async upload(files: Array<Express.Multer.File>, folderId: string) {
        const folder = await this.foldersService.findOne({ id: folderId })
        
        if(!folder) {
            throw new Error('Folder not found')
        }

        //TODO: adjust "/" (being sent from client?)
        await this._setStorageDirectory(folder.drive)
        console.log("here?")
        files.forEach(async (file: Express.Multer.File) => {
            let filename = file.originalname

            //If a duplicate path exists, it will be renamed according to FilesService._getDuplicateRename()
            // Check for duplicates
            if(await this._exists(folder.path + filename)) { 
                filename = await this._getDuplicateRename(filename, folder.path)
            }

            const path = folder.path + "/" + filename
            this._write(file, path)
            .then(() => {
                // Remove the file from /tmp
                fs.unlink(file.path, (err) => {
                    if (err) throw err
                })
                
                // Save to database
                this._save({
                    folder: folder,
                    name: filename,
                    path: path,
                    is_media: this._isMedia(file),
                    mime_type: file.mimetype
                })
            })
        })
    }

    async search(params: FileSearchDTO): Promise<any> {
        let where = {};
        for(const key in params) { 
            where[key] = Like('%' + params[key] + '%')
        }

        return await this.filesRepository.find({ where: where })
    }
}