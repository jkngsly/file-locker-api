import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import Entry from './interfaces/entry.interface'
import * as fs from 'fs'
import * as console from 'console'
import {resolve} from 'node:path';
import {createReadStream} from 'node:fs';
import {FileStorage, Visibility, DirectoryListing, StatEntry } from '@flystorage/file-storage';
import {LocalStorageAdapter} from '@flystorage/local-fs'
import { Readable } from 'stream';

@Injectable()
export class FilesService {
    private readonly files: Entry[] = []

    private rootDirectory: string = resolve(process.cwd(), 'drive');
    private currentDirectory: string = "";
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory));

    create(file: File) {
        //this.files.push(file);
    }

    async getDirectory(path: string = ""): Promise<Entry[]> {
        this.currentDirectory = path;
        const contentsAsAsyncGenerator: DirectoryListing = this.storage.list(this.currentDirectory, {deep: true});

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

            this.files.push(entry);
        }

        return this.files;
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
