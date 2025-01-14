import { BaseEntity } from './base.entity'
import { Folder } from './folder.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('files')
export class HaidaFile extends BaseEntity { 
    @Column()
    id: string 

    @Column()
    folder_id!: string

    @ManyToOne(() => Folder, (folder) => folder.id)
    @JoinColumn({ name: "folder_id" })
    folder: Folder
    
    @Column()
    name!: string

    @Column()
    path!: string

    @Column({
        default: false
    })
    is_media: boolean

    @Column()
    mime_type: string

    /*
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    () {
        this.cover_photo_link = `http://127.0.0.1:4000/destinations/${}`;
    }*/

    async getDrivePath() {
        //TODO: production/devmode  
        return process.env.APP_HOST + "/file/" + this.id + "/download";
    }
}