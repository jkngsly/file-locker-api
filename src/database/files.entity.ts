import { BaseEntity } from './base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity()
export class Files extends BaseEntity { 
    @Column()
    id!: string

    @Column() 
    fk_file_id_file: string // Parent (Folder)

    @Column()
    path!: string

    @Column()
    name!: string

    @Column()
    is_directory!: boolean

    @Column()
    is_file!: boolean

    @Column()
    mime_type: string
}