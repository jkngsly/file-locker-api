import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { File } from './interfaces/file.interface'
import * as fs from 'fs'

@Injectable()
export class FilesService { 
    private readonly files: File[] = []

    create(file: File) { 
        this.files.push(file);
    }

    async readAllFromDirectory(path: string): Promise<File[]> {
        try {
            const fileNames = await fs.promises.readdir(path);
            return await this.mapAllFromDirectory(path, fileNames);
        } catch (err) { 
            throw new Error(`Error reading directory at ${path}: ${err.message}`);
        }
    }

    /*
    findAll(): File[] { 
        return this.files;
    }
    */

    private async mapAllFromDirectory(path: string, fileNames: string[]): Promise<File[]> {
        return Promise.all(
            fileNames.map(async (fileName) => { 
              const filePath = `${path}/${fileName}`;
              const stats = await fs.promises.stat(filePath);
              
              return {
                name: fileName,
                path: filePath,
                size: stats.size,
                createdAt: stats.birthtime,
              }
            })
        );
    }

    /*
    private async mapFile(file: string[]): Promise<File> {
        // Map user to DTO (if needed)
        const fileDTO = new FileDTO();
        fileDTO.id = file['id'];
        fileDTO.name = file['name'];
        fileDTO.email = file.email;

        return 
    }*/
}