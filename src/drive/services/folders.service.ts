import session from "express-session"
import { Inject, Injectable, StreamableFile } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { REQUEST } from "@nestjs/core"
import { DataSource, Repository } from "typeorm"
import { createFolderDTO } from "src/drive/dto/create-folder.dto"
import { BaseService } from "src/drive/services/base.service"
import { resolve } from "path"
import { FileStorage } from "@flystorage/file-storage"
import { LocalStorageAdapter } from "@flystorage/local-fs"

import { Folder } from "@/database/folder.entity"
import { Drive } from "@/database/drive.entity"
import { HaidaFile } from "@/database/haida-file.entity"
import { RequestContext } from "src/common/request-context.service"

interface FolderQueryInterface {
    id?: string
}

@Injectable()
export class FoldersService extends BaseService {
    constructor(
        protected readonly requestContext: RequestContext,
        
        @InjectRepository(Folder)
        protected readonly foldersRepository: Repository<Folder>,
        
        @InjectRepository(Drive)
        protected readonly driveRepository: Repository<Drive>,

        @Inject(FileStorage)
        protected storage: FileStorage,

        private readonly dataSource: DataSource
    ) { 
        super(requestContext, foldersRepository, driveRepository, storage)
    }

    private async _write(folder: any, createDriveRoot=false) {
        // Create a new folder instance
        let newFolder = this.dataSource.manager.create(Folder, folder)

        // Save the new folder in the database
        newFolder = await this.dataSource.manager.save(Folder, newFolder)
        console.log(newFolder)
        let rootPath: string
        if(createDriveRoot) { 
            rootPath = await this._getLocalStoragePath() + `/${folder.drive.id}`            
        } else { 
            rootPath = await this._getDrivePath(folder.drive.id)
        }

        let fileStorage = await this._initStorageAdapter(rootPath);

        // Write the directory
        await fileStorage.createDirectory(newFolder.path)
    }
    

    async getTree(): Promise<any> {
        const folder = await this._getRootFolder()

        if (!folder) {
            throw new Error('folder not found')
        }

        return await this.dataSource.manager.getTreeRepository(Folder).findDescendantsTree(folder)
    }

    async createDriveRoot(drive: Drive) { 
        
        await this._initStorageAdapter(await this._getLocalStoragePath())
        // Create drive folder ex: `drives/{id}` 
        await this._write(
            {
                name: "root",
                path: "",
                parent: null, // If no parent, it's a root folder
                level: 0,
                drive: drive,
            }, true)
    }

    async create(folder: createFolderDTO): Promise<any> {

        // Find the associated drive
        const drive = await this.dataSource.manager.findOne(Drive, {
            // @ts-ignore // TODO: session object
            where: { user_id: this._getUser().id },
        })

        if (!drive) {
            throw new Error('Drive not found')
        }
     
        // Fetch the parent folder
        const parentFolder = await this.foldersRepository.findOne({
            where: { id: folder.parentId },
        })

        if (!parentFolder) {
            throw new Error('Parent folder not found')
        }

        // Construct the path based on the parent folder's path
        let path = `${parentFolder.path}/${folder.name}`
        let level = parentFolder.level + 1  // Increment level based on the parent folder's level
     
        this._write(
            {
                name: folder.name,
                path: path,
                parent: parentFolder,
                level: level,
                drive: drive,
            })
    }
}