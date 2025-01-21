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

@Injectable()
export abstract class BaseService {

    constructor(
        @InjectRepository(Folder)
        protected foldersRepository: Repository<Folder>,

        @InjectRepository(Drive)
        protected driveRepository: Repository<Drive>,

        @Inject(REQUEST)
        protected readonly request: Request,

        @Inject(FileStorage)
        protected storage: FileStorage,
    ) {}

    protected async _getDrive(): Promise<Drive> {

        const drive = await this.driveRepository.findOne({
            // @ts-ignore TODO: Fix this
            where: { user_id: this.request.session.defaultData['userId'] }
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
        // @ts-ignore  (ノಠ益ಠ)ノ彡┻━┻ 
        return resolve(process.cwd(), 'drive/' + this.request.session.defaultData['userId'])
    }

    protected async _initStorageAdapter(): Promise<boolean> {
        try { 
            this.storage = await new FileStorage(new LocalStorageAdapter(await this._getDrivePath()))
            return true;
        } catch(e) { 
            console.log(e);
        }
    }
}