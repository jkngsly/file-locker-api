import { Drives } from 'src/database/drive.entity'
import { BaseEntity } from './base.entity'
import { Files } from './files.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Tree, TreeChildren, TreeLevelColumn, TreeParent } from 'typeorm'

@Entity()
@Tree("closure-table")
export class Folders extends BaseEntity {
    @Column()
    drive_id: string
    
    @ManyToOne(() => Drives, (drive) => drive.id)
    drive: Drives

    @OneToMany(() => Files, (file) => file.folder)
    files: Files[]

    @Column()
    name!: string

    @Column()
    path!: string

    @TreeChildren()
    children: Folders[]

    @TreeParent()
    parent: Folders

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