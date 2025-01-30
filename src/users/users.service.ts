import { Injectable } from '@nestjs/common'
import { User } from '@/database/user.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDTO } from '@/users/dto/update-user.dto';
import { DeleteUserDTO } from '@/users/dto/delete-user.dto';
import { DriveService } from '@/drive/services/drive.service';

@Injectable()
export class UsersService { 
    private readonly users: User[] = []

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        protected driveService: DriveService
    ) {}

    async create(userData: CreateUserDto) { 
        const user = await this.usersRepository.save(this.usersRepository.create(userData))
        const drive = await this.driveService.create(user.id)
    }

    async update(user: any) { 
        await this.usersRepository.save(user)
    }

    async delete(id: string) { 
        await this.usersRepository.delete({ id })
    }

    async findOne(where): Promise<User> {
        return await this.usersRepository.findOne({ where: where, relations: ['drive']})
    }

    async findAll(): Promise<User[]> { 
        return await this.usersRepository.find();
    }
} 