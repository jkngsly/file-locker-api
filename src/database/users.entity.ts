import { BaseEntity } from './base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity()
export class Users extends BaseEntity { 
    @Column()
    email: string

    @Column()
    password: string

    @Column()
    username: string
}