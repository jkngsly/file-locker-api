import { Users } from 'src/database/users.entity'
import { BaseEntity } from './base.entity'
import { Folders } from './folders.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'

@Entity()
export class Drives extends BaseEntity { 
    @Column()
    user_id: string

    @OneToOne(() => Users)
    @JoinColumn({ name: "user_id" })
    user: Users
    
    @OneToMany(() => Folders, (folder) => folder.id)
    @JoinColumn({ name: "drive_id" })
    folders: Folders[]
}