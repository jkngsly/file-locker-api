import { BaseEntity } from './base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity()
export class Users extends BaseEntity { 
    @Column()
    email!: string

    @Column()
    password!: string

    @Column()
    first_name!: string 

    @Column()
    last_name!: string
}