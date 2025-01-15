import session from "express-session";
import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Folder } from "src/database/folder.entity";

interface FolderQueryInterface {
    id?: string
}

@Injectable()
export class FoldersService {
    constructor(
        @InjectRepository(Folder)
        private foldersRepository: Repository<Folder>,

        private readonly dataSource: DataSource
    ) { }

    
}