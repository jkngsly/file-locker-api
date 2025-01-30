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
    user: User

    constructor(
        protected readonly requestContext: RequestContext,
     
        @InjectRepository(Folder)
        protected foldersRepository: Repository<Folder>,

        @InjectRepository(Drive)
        protected driveRepository: Repository<Drive>,

        @Inject(FileStorage)
        protected storage: FileStorage,
    ) {
        this.user = this.requestContext.getUser()
        console.log(this.user, "User (BaseService constructor)")
    }

    protected async _getDrive(): Promise<Drive> {
        
        const drive = await this.driveRepository.findOne({
            // @ts-ignore TODO: Fix this
            where: { user_id: this.user.id }
        })

        if (!drive) {
            throw new Error('Drive not found')
        }

        return drive
    }

    protected async _getRootFolder(): Promise<Folder> {
        
        this.user = this.requestContext.getUser()
        console.log(this.user, "getRootFolder")
        const drive: Drive = await this._getDrive()

        // Fetch the parent folder
        return await this.foldersRepository.findOne({
            where: {
                drive_id: drive.id, is_root: true
            }
        })
    }

    protected async _getDrivePath(): Promise<string> {
        // @ts-ignore  (ノಠ益ಠ)ノ彡┻━┻ 
        return resolve(process.cwd(), 'drive/' + this.user.id)
    }

    protected async _initStorageAdapter(): Promise<FileStorage> {
        try { 
            return new FileStorage(new LocalStorageAdapter(await this._getDrivePath()))
        } catch(e) { 
            console.log(e);
        }
    }
}