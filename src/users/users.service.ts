import { Injectable } from '@nestjs/common'
import { User } from '@/database/user.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDTO } from '@/users/dto/update-user.dto';
import { DeleteUserDTO } from '@/users/dto/delete-user.dto';

@Injectable()
export class UsersService { 
    private readonly users: User[] = []

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(user: CreateUserDto) { 
        user = this.usersRepository.create(user)
        await this.usersRepository.save(user)
    }

    async update(user: UpdateUserDTO) { 
        await this.usersRepository.update(user, { id: user.id })
    }

    async delete(id: string) { 
        await this.usersRepository.delete({ id })
    }

    async findOne(where): Promise<User> {
        return await this.usersRepository.findOne({ where: where })
    }

    async findAll(): Promise<User[]> { 
        return await this.usersRepository.find();
    }
} 