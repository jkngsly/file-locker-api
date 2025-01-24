import { Injectable } from '@nestjs/common'
import { User } from '@/database/user.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CreateUserDto } from '@/users/dto/create-user.dto';

@Injectable()
export class UsersService { 
    private readonly users: User[] = []

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(user: CreateUserDto) { 
        await this.usersRepository.save(user)
    }

    async findOne(where): Promise<User> {
        return await this.usersRepository.findOne({ where: where })
    }

    findAll(): User[] { 
        return this.users;
    }
} 