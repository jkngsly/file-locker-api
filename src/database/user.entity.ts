import { BaseEntity } from './base.entity'
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import bcrypt from 'bcrypt'

@Entity('users')
export class User extends BaseEntity { 
    @Column()
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
        this.password = bcrypt.hash(this.password, salt)
    }
}