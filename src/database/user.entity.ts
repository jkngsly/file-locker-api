import { BaseEntity } from './base.entity'
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import * as bcrypt from 'bcryptjs'

@Entity('users')
export class User extends BaseEntity { 
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string

    @Column()
    first_name!: string 

    @Column()
    last_name!: string

    @BeforeInsert()
    async hashPassword() { 
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
}