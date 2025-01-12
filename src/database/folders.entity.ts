import { BaseEntity } from './base.entity'
import { Files } from './files.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Tree, TreeChildren, TreeLevelColumn, TreeParent } from 'typeorm'

@Entity()
@Tree("closure-table")
export class Folders extends BaseEntity { 
    /*@Column()
    folder_id!: string
*/

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

    
    @TreeChildren()
    children: Folders[]

    @TreeParent()
    parent: Folders

    @TreeLevelColumn()
    level: number
}