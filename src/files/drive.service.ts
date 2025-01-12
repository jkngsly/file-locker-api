import { Injectable } from '@nestjs/common'
import Entry from './interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import {resolve} from 'node:path';
import {FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage';
import {LocalStorageAdapter} from '@flystorage/local-fs'
import { unlink } from 'node:fs';
import { Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Files } from '../database/files.entity'
import { createFolderDTO } from 'src/files/dto/create-folder.dto';
import { UploadFilesDTO } from 'src/files/dto/upload-files.dto';
import { createDriveDTO } from 'src/files/dto/create-drive.dto';
import { Folders } from 'src/database/folders.entity';
import { Drives } from 'src/database/drive.entity';

@Injectable()
export class DriveService {

    constructor(
        @InjectRepository(Files)
        private filesRepository: Repository<Files>,
        
        @InjectRepository(Folders)
        private foldersRepository: Repository<Folders>,

        @InjectRepository(Drives)
        private drivesRepository: Repository<Drives>
    ) {}

    private rootDirectory: string = resolve(process.cwd(), 'drive')
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory))
    private queryBuilder: SelectQueryBuilder<Files> = this.filesRepository.createQueryBuilder('files')

    // TODO: Auth layer
    private userId: string = "2d8902f1-1293-4f11-b8f8-06cfb0ea8caf"
    private driveId: string = "3bb5a2d6-edb0-4139-b139-5a93e7c38886"

    async upload(files: Array<Express.Multer.File>, dto: UploadFilesDTO) {
        const path = await this.getParentPath(dto.parentId)
        files.forEach((file: Express.Multer.File, index) => {
            this.write(file, path)
            .then(() => {
                // Remove the file from /tmp
                unlink(file.path, (err) => {
                    if (err) throw err
                });

                return this.filesRepository.save({
                    path: file.path,
                    name: file.filename,
                    is_directory: false,
                    is_file: true,
                    is_drive: false,
                    mime_type: file.mimetype,
                    parentId: dto.parentId
                });
            });
        });
    }

    private async write(file: Express.Multer.File, directory: string): Promise<boolean> {
        try {
            // TODO: Check for duplicates
            const content = fs.createReadStream(file.path);
            await this.storage.write(file.originalname, content);
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
            const pathParts = folder.path.replace(/\\/g, '/').split('/');
            let currentLevel = root;
    
            // Traverse or create the necessary parent folders
            pathParts.forEach((part, index) => {
                // Check if a folder at this level already exists
                let existingFolder = currentLevel.find(f => f.path === part);
                if (!existingFolder) {
                    // If not, create a new folder object
                    existingFolder = { fullPath: folder.path.replaceAll('\\', '/'), path: part, children: [] }
                    currentLevel.push(existingFolder)
                }
                currentLevel = existingFolder.children  // Move to the next level of the tree
            });
        });
    
        return root;
    }

    /*
     

    const users: User[] = await usersQueryBuilder
      .where('user.username = :username', { username: usersInput.username })
      .getMany();

    return users;
    */

    private async getPathById(id: string) { 
        return this.queryBuilder.select('files.path').where('files.id = :id', { id: id })
        .getOneOrFail();
    }

    private async getParentPath(id: string) { 
        const parent = await this.getPathById(id);
        return parent.path;
    }

    async createFolder(dto: createFolderDTO): Promise<any> { 
        let path = await this.getParentPath(dto.parentId)
        path += "/" + dto.name

        this.storage.createDirectory(path)
        
        this.filesRepository.save({
            path: path,
            name: dto.name,
            is_directory: true,
            is_file: false,
            is_drive: false,
            fk_file_id_file: dto.parentId
        });
    }

    async createDrive(dto: createDriveDTO): Promise<any> { 
        this.storage.createDirectory(dto.userId)

        return this.drivesRepository.save({
            user_id: dto.userId
        });
    }

    async getAllDirectories(): Promise<Object[]> { 
        const listing = this.storage.list("", { deep: true})

        const entries = [];
        for await (const entry of listing) {
            if(entry.isDirectory) { 
                entries.push(entry);
            }
        }

        const directories = this.buildFolderHierarchy(entries)
        return directories;
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

        return files;
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
