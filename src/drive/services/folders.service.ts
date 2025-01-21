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

interface FolderQueryInterface {
    id?: string
}

@Injectable()
export class FoldersService extends BaseService {
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

        private readonly dataSource: DataSource
    ) { 
        super(foldersRepository, driveRepository, request, storage)
    }

    
    private async _write(folder: any) {
        // Create a new folder instance
        const newFolder = this.dataSource.manager.create(Folder, folder)

        // Save the new folder in the database
        await this.dataSource.manager.save(Folder, newFolder)

        // TODO: SEPARATE 
        // @ts-ignore // TODO: session object
        let rootDirectory: string = resolve(process.cwd(), 'drive/' + this.request.session.defaultData['userId'])
        let fileStorage = new FileStorage(new LocalStorageAdapter(rootDirectory))

        // Perform additional operations like creating a directory on your storage system
        fileStorage.createDirectory(newFolder.path)
    }
    

    async getTree(): Promise<any> {
        const folder = await this._getRootFolder()

        if (!folder) {
            throw new Error('folder not found')
        }

        return await this.dataSource.manager.getTreeRepository(Folder).findDescendantsTree(folder)
    }

    async create(dto: createFolderDTO): Promise<any> {
        let parentFolder: Folder | undefined = undefined

        // Find the associated drive
        const drive = await this.dataSource.manager.findOne(Drive, {
            // @ts-ignore // TODO: session object
            where: { user_id: this.request.session.defaultData['userId'] },
        })

        if (!drive) {
            throw new Error('Drive not found')
        }

        let path = ""
        let level = 0

        // Check if there is a parent folder
        if (dto.parentId) {
            // Fetch the parent folder
            parentFolder = await this.foldersRepository.findOne({
                where: { id: dto.parentId },
            })

            if (!parentFolder) {
                throw new Error('Parent folder not found')
            }

            // Construct the path based on the parent folder's path
            path += `${parentFolder.path}/`
            level = parentFolder.level + 1  // Increment level based on the parent folder's level
        } else {
            parentFolder = await this._getRootFolder()
        }

        // Add the new folder's name to the path
        path += `${dto.name}`

        this._write(
            {
                name: dto.name,
                path: path,
                parent: parentFolder || null, // If no parent, it's a root folder
                level: level,
                drive: drive,
            })
    }
}