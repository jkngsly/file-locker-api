import session from "express-session"

import { Inject, Injectable, StreamableFile } from '@nestjs/common'
import { DataSource, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Folder } from '@/database/folder.entity'
import { Drive } from '@/database/drive.entity'
import { HaidaFile } from '@/database/haida-file.entity'
import { REQUEST } from "@nestjs/core"
import { resolve } from "path"
import { FileStorage } from "@flystorage/file-storage"
import { LocalStorageAdapter } from "@flystorage/local-fs"
import { User } from "@/database/user.entity"
import { RequestContext } from "src/common/request-context.service"

@Injectable()
export abstract class BaseService {
    constructor(
        protected readonly requestContext: RequestContext,
     
        @InjectRepository(Folder)
        protected foldersRepository: Repository<Folder>,

        @InjectRepository(Drive)
        protected driveRepository: Repository<Drive>,

        @Inject(FileStorage)
        protected storage: FileStorage,
    ) { }

    protected _getUser() { 
        return this.requestContext.getUser()
    }

    protected async _getDrive(): Promise<Drive> {
        
        const drive = await this.driveRepository.findOne({
            where: { user_id: this._getUser().id }
        })

        if (!drive) {
            throw new Error('Drive not found')
        }

        return drive
    }

    protected async _getRootFolder(): Promise<Folder> {
        const drive: Drive = await this._getDrive()

        // Fetch the parent folder
        return await this.foldersRepository.findOne({
            where: {
                drive_id: drive.id, is_root: true
            }
        })
    }

    protected async _getDrivePath(): Promise<string> {
        return resolve(process.cwd(), 'drive/' + this._getUser().drive.id)
    }

    protected async _initStorageAdapter(): Promise<FileStorage> {
        try { 
            return new FileStorage(new LocalStorageAdapter(await this._getDrivePath()))
        } catch(e) { 
            console.log(e);
        }
    }
}