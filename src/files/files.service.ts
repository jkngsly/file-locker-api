import { Injectable } from '@nestjs/common'
import Entry from './interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import {resolve} from 'node:path';
import {FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage';
import {LocalStorageAdapter} from '@flystorage/local-fs'
import { unlink } from 'node:fs';

@Injectable()
export class FilesService {
    private rootDirectory: string = resolve(process.cwd(), 'drive');
    private currentDirectory: string = "";
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory));

    async upload(files: Array<Express.Multer.File>, directory: string) {
        files.forEach((file: Express.Multer.File, index) => {
            this.create(file, directory)
            // Remove the file from /tmp
            .then(() => {
                unlink(file.path, (err) => {
                    if (err) throw err;
                });
            });
        });
    }

    async create(file: Express.Multer.File, directory: string): Promise<boolean> {
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

    async getDirectory(path: string = ""): Promise<Entry[]> {
        this.currentDirectory = path;
        const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(this.currentDirectory, {deep: false});

        console.log(contentsAsAsyncGenerator);

        let files: Entry[] = []

        for await (const item of contentsAsAsyncGenerator) {
            
            let entry: Entry = { 
                path: item.path,
                fullPath: this.currentDirectory + '/' + item.path,
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

        console.log(files);

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
