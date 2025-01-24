import { User } from 'src/database/user.entity'
import { BaseEntity } from './base.entity'
import { Folder } from './folder.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity('drives')
export class Drive extends BaseEntity { 
    @Column()
    user_id: string

    @OneToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User
    
    @OneToMany(() => Folder, (folder) => folder.id)
    @JoinColumn({ name: "drive_id" })
    folders: Folder[]
}