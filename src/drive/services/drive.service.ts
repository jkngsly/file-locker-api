import session from "express-session"

import { Inject, Injectable, StreamableFile } from '@nestjs/common'
import { resolve } from 'path'
import { FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage'
import { LocalStorageAdapter } from '@flystorage/local-fs'
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Folder } from '@/database/folder.entity'
import { Drive } from '@/database/drive.entity'
import { BaseService } from './base.service'
import { HaidaFile } from '@/database/haida-file.entity'
import { REQUEST } from "@nestjs/core"

@Injectable()
export class DriveService extends BaseService {
    constructor(
        @InjectRepository(Folder)
        protected readonly foldersRepository: Repository<Folder>,
        
        @InjectRepository(Drive)
        protected readonly driveRepository: Repository<Drive>,

        @InjectRepository(HaidaFile)
        private filesRepository: Repository<HaidaFile>,

        @Inject(REQUEST)
        protected readonly request: Request,

        private readonly dataSource: DataSource
    ) { 
        super(foldersRepository, driveRepository, request)
    }

    private rootDirectory: string = resolve(process.cwd(), 'drive')
    private storage: FileStorage = new FileStorage(new LocalStorageAdapter(this.rootDirectory))
    //private queryBuilder: SelectQueryBuilder<Files> = this.filesRepository.createQueryBuilder()

    // TODO: Auth layer
    private userId: string = "bbb1adf5-bfbc-45ec-a131-61c97595e8be"
    private driveId: string = "9e435bfb-69fa-48a6-bb0f-14840d9762b1"

    /*
    async create(dto: createDriveDTO): Promise<any> {
        this.storage.createDirectory(dto.userId)

        const drive = await this.driveRepository.save({
            user_id: dto.userId
        })

        /*
        return this.foldersService.create({
            name: "root",
            path: "",
            level: 0,
            drive: drive,
            is_root: true
        }) 
    }*/
}
