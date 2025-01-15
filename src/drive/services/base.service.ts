import session from "express-session";

import { Inject, Injectable, StreamableFile } from '@nestjs/common'
import { DataSource, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Folder } from 'src/database/folder.entity'
import { Drive } from 'src/database/drive.entity'
import { HaidaFile } from 'src/database/haida-file.entity'
import { REQUEST } from "@nestjs/core";

@Injectable()
export abstract class BaseService {

    constructor(    
        @InjectRepository(Folder)
        protected foldersRepository: Repository<Folder>,

        @InjectRepository(Drive)
        protected driveRepository: Repository<Drive>,
        
        @Inject(REQUEST)
        protected readonly request: Request,
    ) {
        
    }

    protected async _getDrive(): Promise<Drive> {         

        const drive = await this.driveRepository.findOne({
            // @ts-ignore TODO: Fix this
            where: { user_id: this.request.session.defaultData['userId'] }
        });

        if (!drive) {
            throw new Error('Drive not found');
        }

        return drive;
    }

    protected async _getRootFolder(): Promise<Folder> {
        const drive: Drive = await this._getDrive(); 
        
        // Fetch the parent folder
        return await this.foldersRepository.findOne({
            where: { 
                drive_id: drive.id, is_root: true 
            }
        });
    }
}