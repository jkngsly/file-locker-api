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
    ) { }

    protected _getUser() { 
        return this.requestContext.getUser()
    }

    protected async _getRootFolder(): Promise<Folder> {
        return await this.foldersRepository.findOne({
            where: {
                drive_id: this._getUser().drive.id, is_root: true
            }
        })
    }

    protected async _getDrivePath(driveId: string): Promise<string> {
        return resolve(process.cwd(), `${process.env.LOCAL_STORAGE_PATH}/${driveId}`)
    }

    protected async _getLocalStoragePath(): Promise<string> {
        return resolve(process.cwd(), process.env.LOCAL_STORAGE_PATH)
    }

    protected async _initStorageAdapter(basePath: string): Promise<FileStorage> {
        try { 
            return new FileStorage(new LocalStorageAdapter(basePath))
        } catch(e) { 
            console.log(e);
        }
    }
}