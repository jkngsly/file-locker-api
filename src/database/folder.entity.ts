import { Drive } from 'src/database/drive.entity'
import { BaseEntity } from './base.entity'
import { HaidaFile } from './haida-file.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeLevelColumn, TreeParent } from 'typeorm'

@Entity('folders')
@Tree("closure-table")
export class Folder extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string
    
    @Column()
    drive_id: string

    @Column()
    parent_id: string
    
    @ManyToOne(() => Drive, (drive) => drive.id)
    drive: Drive

    @OneToMany(() => HaidaFile, (file) => file.folder)
    files: HaidaFile[]

    @Column()
    name!: string

    @Column()
    path!: string

    @TreeChildren()
    children: Folder[]

    @TreeParent()
    parent: Folder

    @Column({
        default: 0
    })
    @TreeLevelColumn()
    level: number

    @Column({
        default: false,
    })
    is_root: boolean
}