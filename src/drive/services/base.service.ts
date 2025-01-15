import { Injectable, StreamableFile } from '@nestjs/common'
import { DataSource, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Folder } from 'src/database/folder.entity'
import { Drive } from 'src/database/drive.entity'
import { HaidaFile } from 'src/database/haida-file.entity'

@Injectable()
export abstract class BaseService<Drive, Folder> {
    protected foldersRepository: Repository<Folder>
    protected driveRepository: Repository<Drive>

    protected async _getDrive(): Promise<Drive> { 
        const drive = await this.driveRepository.findOne({
            // @ts-ignore // TODO: session object
            where: { user_id: session.userId }
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
            // @ts-ignore
            drive_id: Drive.id, is_root: true 
        });
    }
}