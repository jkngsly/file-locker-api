import { Controller, Get, Post, Body } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'
import { User } from './interfaces/user.interface'

@Controller('users')
export class UsersController { 
    constructor(private usersService: UsersService) {}

    @Post('create')
    async create(@Body() createUserDto: CreateUserDto): Promise<any> { 
        await this.usersService.create(createUserDto)
    }

    /*
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll()
    }*/
}
