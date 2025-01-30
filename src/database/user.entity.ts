import { BaseEntity } from './base.entity'
import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Drive } from '@/database/drive.entity'

@Entity('users')
export class User extends BaseEntity { 
    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column()
    first_name: string 

    @Column()
    last_name: string

    @Column({
        nullable: true
    })
    refresh_token: string

    @OneToMany(() => Drive, (drive) => drive.user)
    drive: Drive

    @BeforeInsert()
    async hashPassword() { 
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
}