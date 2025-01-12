import { BaseEntity } from './base.entity'
import { Files } from './files.entity'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'

@Entity()
export class Folders extends BaseEntity { 
    @ManyToOne(() => Folders, (folder) => folder.id)
    folder: Folders

    @OneToMany(() => Files, (file) => file.folder)
    files: Files[]

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