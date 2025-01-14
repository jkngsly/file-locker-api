import { BaseEntity } from './base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

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
}