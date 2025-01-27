import { 
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

export class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @CreateDateColumn({ type: 'timestamptz'})
    readonly created_at: Date

    @UpdateDateColumn({ type: 'timestamptz'})
    readonly updated_at: Date

    @DeleteDateColumn({ type: 'timestamptz' })
    deleted_at: Date
}