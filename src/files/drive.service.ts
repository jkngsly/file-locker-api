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

    async upload(files: Array<Express.Multer.File>, dto: UploadFilesDTO) {
        const path = "" //await this.getParentPath(dto.parentId)
        files.forEach((file: Express.Multer.File, index) => {
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

    private async write(file: Express.Multer.File, directory: string): Promise<boolean> {
        try {
            // TODO: Check for duplicates
            const content = fs.createReadStream(file.path)
            await this.storage.write(file.originalname, content)
            return true
        } catch (err) {
            if (err instanceof UnableToWriteFile) {
                console.log(err)
            }
        }
    }

    private buildFolderHierarchy(folders) {
        const root = []
    
        folders.forEach(folder => {
            const pathParts = folder.path.replace(/\\/g, '/').split('/')
            let currentLevel = root
    
            // Traverse or create the necessary parent folders
            pathParts.forEach((part, index) => {
                // Check if a folder at this level already exists
                let existingFolder = currentLevel.find(f => f.path === part)
                if (!existingFolder) {
                    // If not, create a new folder object
                    existingFolder = { fullPath: folder.path.replaceAll('\\', '/'), path: part, children: [] }
                    currentLevel.push(existingFolder)
                }
                currentLevel = existingFolder.children  // Move to the next level of the tree
            })
        })
    
        return root
    }

    /*
     

    const users: User[] = await usersQueryBuilder
      .where('user.username = :username', { username: usersInput.username })
      .getMany()

    return users
    */

    
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
    
        console.log(drive);
    
        let path = this.userId;
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
    
        // Perform additional operations like creating a directory on your storage system
        this.storage.createDirectory(newFolder.path);
    }

    async createFolder2(dto: createFolderDTO): Promise<any> { 
        let parentFolder: Folders | undefined = undefined
        
        let drive = await this.drivesRepository.findOne({ 
            where: { 
                id: this.driveId
            }
        })

        console.log(drive)

        let path = this.userId
        let level = 0

        if (dto.parentId) {
            parentFolder = await this.foldersRepository.findOne({ 
                where: { 
                    id: dto.parentId
                }
            })

            path += "/" + parentFolder.path

            if (!parentFolder) {
              throw new Error('Parent folder not found')
            }

            level = parentFolder.level + 1  // Increment level based on the parent folder's level      
          }

          path += "/" + dto.name

          let newFolder = this.foldersRepository.create({
            name: dto.name,
            path: path,
            parent: parentFolder || null, // If parent is null, it's a root folder
            level: level,
            drive: drive
          })

          const savedFolder = await this.foldersRepository.save(newFolder)
        
        this.storage.createDirectory(newFolder.path)

    }

    async createDrive(dto: createDriveDTO): Promise<any> { 
        this.storage.createDirectory(dto.userId)

        return this.drivesRepository.save({
            user_id: dto.userId
        })
    }
/*
    async getAllDirectories(): Promise<Object[]> { 
        const listing = this.storage.list("", { deep: true})

        const entries = []
        for await (const entry of listing) {
            if(entry.isDirectory) { 
                entries.push(entry)
            }
        }

        const directories = this.buildFolderHierarchy(entries)
        return directories
    }
*/

    async getAllDirectories(): Promise<Folders[]> { 
        // Method to retrieve all folders in a nested (tree-like) structure
        // Fetch all folders, including their hierarchical relationships
        //const folders = await this.foldersRepository.find({
       // relations: ['parent', 'children'], // Include parent and children relationships
       // });

        const trees = await this.dataSource.manager.getTreeRepository(Folders).findTrees()

        // Return the entire list of folders, this can be rendered in a tree format
        return trees;
    }

    async get(path: string = ""): Promise<Entry[]> {
        const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path)

        let files: Entry[] = []

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
        }

        return files
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
