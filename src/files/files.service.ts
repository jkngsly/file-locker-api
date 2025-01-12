import { Injectable } from '@nestjs/common'
import Entry from './interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import {resolve} from 'node:path';
import {FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage';
import {LocalStorageAdapter} from '@flystorage/local-fs'
import { unlink } from 'node:fs';
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Files } from '../database/files.entity'

@Injectable()
export class FilesService {

    constructor(
        @InjectRepository(Files)
        private filesRepository: Repository<Files>
    ) {}

    private rootDirectory: string = resolve(process.cwd(), 'drive');
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory));

    async upload(files: Array<Express.Multer.File>, directory: string) {
        files.forEach((file: Express.Multer.File, index) => {
            this.write(file, directory)
            // Remove the file from /tmp
            .then(() => {
                unlink(file.path, (err) => {
                    if (err) throw err;
                });

                /*
                *
                    @Column()
                    path!: string
                
                    @Column()
                    name!: string
                
                    @Column()
                    isDirectory!: boolean
                
                    @Column()
                    isFile!: boolean
                */
                return this.filesRepository.save({
                    path: file.path,
                    name: file.filename,
                    is_directory: false,
                    is_file: true,
                    mime_type: file.mimetype,
                });
            });
        });
    }

    async write(file: Express.Multer.File, directory: string): Promise<boolean> {
        try {
            // TODO: Check for duplicates
            const content = fs.createReadStream(file.path);
            await this.storage.write(file.originalname, content);
            return true;
        } catch (err) {
            if (err instanceof UnableToWriteFile) {
                console.log(err);
            }
        }
    }

    private buildFolderHierarchy(folders) {
        const root = [];
    
        folders.forEach(folder => {
            const pathParts = folder.path.replace(/\\/g, '/').split('/');
            let currentLevel = root;
    
            // Traverse or create the necessary parent folders
            pathParts.forEach((part, index) => {
                // Check if a folder at this level already exists
                let existingFolder = currentLevel.find(f => f.path === part);
                if (!existingFolder) {
                    // If not, create a new folder object
                    existingFolder = { fullPath: folder.path.replaceAll('\\', '/'), path: part, children: [] };
                    currentLevel.push(existingFolder);
                }
                currentLevel = existingFolder.children;  // Move to the next level of the tree
            });
        });
    
        return root;
    }

    async getAllDirectories(): Promise<Object[]> { 
        const listing = this.storage.list("", { deep: true});

        const entries = [];
        for await (const entry of listing) {
            if(entry.isDirectory) { 
                entries.push(entry);
            }
        }

        const directories = this.buildFolderHierarchy(entries);
        return directories;
    }

    async get(path: string = ""): Promise<Entry[]> {
        const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(path);

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

                files.push(entry);
            }

        }

        return files;
    }

    // TODO: move to client
    private async isImage(filePath) {
        const path = await import('path');
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        const extname = path.extname(filePath).toLowerCase();
        console.log(allowedExtensions.includes(extname));
        return allowedExtensions.includes(extname);
    }
}
