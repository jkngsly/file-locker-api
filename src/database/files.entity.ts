import { BaseEntity } from './base.entity'
import { Folders } from './folders.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity()
export class Files extends BaseEntity { 
    @Column()
    folder_id!: string

    @ManyToOne(() => Folders, (folder) => folder.id)
    @JoinColumn({ name: "folder_id" })
    folder: Folders
    
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
}