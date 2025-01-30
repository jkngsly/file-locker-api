import session from "express-session"

import { Inject, Injectable, StreamableFile } from '@nestjs/common'
import { FileStorage, DirectoryListing, UnableToWriteFile } from '@flystorage/file-storage'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Folder } from '@/database/folder.entity'
import { Drive } from '@/database/drive.entity'
import { BaseService } from './base.service'
import { RequestContext } from "src/common/request-context.service"

@Injectable()
export class DriveService extends BaseService {

    constructor(
        protected readonly requestContext: RequestContext,

        @InjectRepository(Folder)
        protected readonly foldersRepository: Repository<Folder>,
        
        @InjectRepository(Drive)
        protected readonly driveRepository: Repository<Drive>,

        @Inject(FileStorage)
        protected storage: FileStorage
        
    ) { 
        super(requestContext, foldersRepository, driveRepository, storage)
    }

    // TODO: Auth layer
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
