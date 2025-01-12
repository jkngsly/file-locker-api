import { BaseEntity } from './base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity()
export class File extends BaseEntity { 
    @Column()
    id!: string

    @Column() 
    fk_file_id_file: string // Parent (Folder)

    @Column()
    path!: string

    @Column()
    name!: string

    @Column()
    isDirectory!: boolean

    @Column()
    isFile!: boolean

    @Column()
    username: string
}