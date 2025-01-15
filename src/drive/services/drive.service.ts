import { Injectable, StreamableFile } from '@nestjs/common'
import Entry from '../interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import path, { resolve } from 'node:path'
import { FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage'
import { LocalStorageAdapter } from '@flystorage/local-fs'
import { unlink } from 'node:fs'
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { createFolderDTO } from 'src/drive/dto/create-folder.dto'
import { UploadFilesDTO } from 'src/drive/dto/upload.dto'
import { createDriveDTO } from 'src/drive/dto/create-drive.dto'
import { Folder, Folders } from 'src/database/folder.entity'
import { Drives } from 'src/database/drive.entity'
import { Files } from 'src/database/files.entity'
import { Users } from 'src/database/user.entity'
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class DriveService {

    constructor(
        @InjectRepository(Files)
        private filesRepository: Repository<Files>,

        @InjectRepository(Folders)
        private foldersRepository: Repository<Folders>,

        @InjectRepository(Drives)
        private drivesRepository: Repository<Drives>,

        private readonly dataSource: DataSource
    ) { }

    private rootDirectory: string = resolve(process.cwd(), 'drive')
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory))
    //private queryBuilder: SelectQueryBuilder<Files> = this.filesRepository.createQueryBuilder()

    // TODO: Auth layer
    private userId: string = "bbb1adf5-bfbc-45ec-a131-61c97595e8be"
    private driveId: string = "9e435bfb-69fa-48a6-bb0f-14840d9762b1"

    private async getParentPath(id?: string): Promise<string> {
        let path = "";

        return path;
    }


    private async getRootFolder() { 
        const drive = await this.dataSource.manager.findOne(Drive, {
            // @ts-ignore
            where: { user_id: session.userId }
        });

        if (!drive) {
            throw new Error('Drive not found');
        }

        // Fetch the parent folder
        return await this.dataSource.manager.findOne(Folder, {
            where: { drive_id: drive.id, is_root: true },
        });
    }

    async createFile(file: Express.Multer.File, folder: Folder) { 
        this._write(file, folder.path)
    }

    private async _getFile(id: string): Promise<Object> {
        return await this.filesRepository.findOne({ where: { id: id  }})
    }

    async downloadFile(id: string): Promise<StreamableFile> { 
        const f = await this._getFile(id)
        // @ts-ignore
        const file = createReadStream(join(process.cwd(), 'drive/' + this.userId + '/' + f.path))
        return new StreamableFile(file,  {
            type: 'application/json',
            // @ts-ignore
            disposition: 'attachment; filename="' + f.name + '"',
            // If you want to define the Content-Length value to another value instead of file's length:
            // length: 123,
          })

         
        /*// const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path)
        return await this.dataSource.manager.findOne(Files, {
            where: { id: id },
        });*/
    }

    async getFile(id: string): Promise<Object> { 
        // const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path)
        return this._getFile(id);
    }

    async getFiles(folderId?: string): Promise<Object> {
        // const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path)
        let folder = null;

        let where = null;
        if (folderId) {
            
            folder = await this.dataSource.manager.findOne(Folders, {
                where: { id: folderId },
                select: ["path"]
            });

            where = { 
                folder_id: folderId
            }
        } else { 
            folder = await this.getRootFolder();

            where = { 
                folder_id: folder.id
            }
        }
        return {
            files: await this.filesRepository.find({ where: where }),
            folder: folder
        }

    }

    private async writeFolder(folder: any) {
        // Create a new folder instance
        const newFolder = this.dataSource.manager.create(Folders, folder);

        // Save the new folder in the database
        await this.dataSource.manager.save(Folders, newFolder);

        // TODO: SEPARATE 
        let rootDirectory: string = resolve(process.cwd(), 'drive/' + this.userId)
        let fileStorage = new FileStorage(new LocalStorageAdapter(rootDirectory))

        // Perform additional operations like creating a directory on your storage system
        fileStorage.createDirectory(newFolder.path);
    }

    async createFolder(dto: createFolderDTO): Promise<any> {
        let parentFolder: Folders | undefined = undefined;

        // Find the associated drive
        const drive = await this.dataSource.manager.findOne(Drives, {
            where: { user_id: this.userId },
        });

        if (!drive) {
            throw new Error('Drive not found');
        }

        let path = "";
        let level = 0;

        // Check if there is a parent folder
        if (dto.parentId) {
            // Fetch the parent folder
            parentFolder = await this.dataSource.manager.findOne(Folders, {
                where: { id: dto.parentId },
            });

            if (!parentFolder) {
                throw new Error('Parent folder not found');
            }

            // Construct the path based on the parent folder's path
            path += `${parentFolder.path}/`;
            level = parentFolder.level + 1;  // Increment level based on the parent folder's level
        } else { 
            parentFolder = await this.getRootFolder();
        }

        // Add the new folder's name to the path
        path += `${dto.name}`;

        this.writeFolder(
            {
                name: dto.name,
                path: path,
                parent: parentFolder || null, // If no parent, it's a root folder
                level: level,
                drive: drive,
            });
    }

    async createDrive(dto: createDriveDTO): Promise<any> {
        this.storage.createDirectory(dto.userId)

        const drive = await this.drivesRepository.save({
            user_id: dto.userId
        })

        return this.writeFolder({
            name: "root",
            path: "",
            level: 0,
            drive: drive,
            is_root: true
        });
    }

    async getFolders(id?: string): Promise<any> {
        let folder = null;

        if (id) {
            folder = await this.dataSource.manager.findOne(Folders, {
                where: { id: id },
            });
        } else {
            // Fetch the parent folder
            folder = await this.getRootFolder();
        }

        if (!folder) {
            throw new Error('folder not found');
        }


        return await this.dataSource.manager.getTreeRepository(Folders).findDescendantsTree(
            folder,
        )
    }

    // TODO: move to client
    private async isImage(filePath) {
        const path = await import('path')
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
        const extname = path.extname(filePath).toLowerCase()
        console.log(allowedExtensions.includes(extname))
        return allowedExtensions.includes(extname)
    }
}
