import { Injectable } from '@nestjs/common'
import Entry from './interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import {resolve} from 'node:path'
import {FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage'
import {LocalStorageAdapter} from '@flystorage/local-fs'
import { unlink } from 'node:fs'
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { createFolderDTO } from 'src/files/dto/create-folder.dto'
import { UploadFilesDTO } from 'src/files/dto/upload-files.dto'
import { createDriveDTO } from 'src/files/dto/create-drive.dto'
import { Folders } from 'src/database/folders.entity'
import { Drives } from 'src/database/drive.entity'
import { Files } from 'src/database/files.entity'
import { Users } from 'src/database/users.entity'

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
    ) {}

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

    async upload(files: Array<Express.Multer.File>, dto: UploadFilesDTO) {
        let parentFolder: Folders | undefined = undefined;
        let path = "";

        // Access the entity manager from the DataSource
        const entityManager = this.dataSource.manager;
    
        // Check if there is a parent folder
        if (dto.parentId) {
            // Fetch the parent folder
            parentFolder = await entityManager.findOne(Folders, {
                where: { id: dto.parentId },
            });
    
            if (!parentFolder) {
            throw new Error('Parent folder not found');
            }
    
            // Construct the path based on the parent folder's path
            path += `/${parentFolder.path}`;
        }
    
        files.forEach((file: Express.Multer.File, index) => {
            path =  + "/" + file.originalname;
            console.log(path);
            return false;
            this.write(file, path)
            .then(() => {
                // Remove the file from /tmp
                unlink(file.path, (err) => {
                    if (err) throw err
                })

                return this.filesRepository.save({
                    path: file.path,
                    name: file.filename,
                    is_directory: false,
                    is_file: true,
                    is_drive: false,
                    mime_type: file.mimetype,
                    parentId: dto.parentId
                })
            })
        })
    }

    private async write(file: Express.Multer.File, path: string): Promise<boolean> {
        try {
            // TODO: Check for duplicates
            const content = fs.createReadStream(file.path)

            // TODO: SEPARATE 
            let rootDirectory: string = resolve(process.cwd(), 'drive/' + this.userId)
            let fileStorage = new FileStorage(new LocalStorageAdapter(rootDirectory))

            await fileStorage.write(path, content)
            return true
        } catch (err) {
            if (err instanceof UnableToWriteFile) {
                console.log(err)
            }
        }
    }


    async get(path: string = ""): Promise<Entry[]> {
       // const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path)

        let files: Entry[] = []
/*
        for await (const item of contentsAsAsyncGenerator) {
            
            if(item.isFile) { 
                let entry: Entry = { 
                    path: item.path,
                    type: item.type,
                    isFile: item.isFile,
                    isDirectory: item.isDirectory,
                    isImage: await this.isImage(item.path)
                }

                if(entry.isFile && entry.isImage) { 
                    //entry.thumbnail = 
                }

                files.push(entry)
            }
        }*/

        return files
    }


    async createFolder(dto: createFolderDTO): Promise<any> { 
        let parentFolder: Folders | undefined = undefined;
    
        // Access the entity manager from the DataSource
        const entityManager = this.dataSource.manager;
    
        // Find the associated drive
        const drive = await entityManager.findOne(Drives, {
            where: { id: this.driveId },
        });
    
        if (!drive) {
            throw new Error('Drive not found');
        }
    
        let path = "";
        let level = 0;
    
        // Check if there is a parent folder
        if (dto.parentId) {
            // Fetch the parent folder
            parentFolder = await entityManager.findOne(Folders, {
            where: { id: dto.parentId },
            });
    
            if (!parentFolder) {
            throw new Error('Parent folder not found');
            }
    
            // Construct the path based on the parent folder's path
            path += `/${parentFolder.path}`;
            level = parentFolder.level + 1;  // Increment level based on the parent folder's level
        }
    
        // Add the new folder's name to the path
        path += `/${dto.name}`;
    
        // Create a new folder instance
        const newFolder = entityManager.create(Folders, {
            name: dto.name,
            path: path,
            parent: parentFolder || null, // If no parent, it's a root folder
            level: level,
            drive: drive,
        });
    
        // Save the new folder in the database
        await entityManager.save(Folders, newFolder);
        
        // TODO: SEPARATE 
        let rootDirectory: string = resolve(process.cwd(), 'drive/' + this.userId)
        let fileStorage = new FileStorage(new LocalStorageAdapter(rootDirectory))

        // Perform additional operations like creating a directory on your storage system
        fileStorage.createDirectory(newFolder.path);
    }

    async createDrive(dto: createDriveDTO): Promise<any> { 
        this.storage.createDirectory(dto.userId)

        return this.drivesRepository.save({
            user_id: dto.userId
        })
    }

    async getFolders(id?: string): Promise<any> { 
        if(id) { 
            const entityManager = this.dataSource.manager;
            const folder = await entityManager.findOne(Folders, {
                where: { id: id },
            });
    
            if (!folder) {
            throw new Error('folder not found');
            }


            return await this.dataSource.manager.getTreeRepository(Folders).findDescendantsTree(
                folder,
                { depth: 1},
            )
        } else { 
            return await this.dataSource.manager.getTreeRepository(Folders).findTrees()

        }
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
