import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'
import { User } from '@/database/user.entity'
import { UpdateUserDTO } from '@/users/dto/update-user.dto'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('users')
export class UsersController { 
    constructor(private usersService: UsersService) {}

    @Post('create')
    async create(@Body() createUserDto: CreateUserDto): Promise<any> { 
        await this.usersService.create(createUserDto)
    }

    @Post('update')
    async update(@Body() UpdateUserDto: UpdateUserDTO): Promise<any> { 
        await this.usersService.update(UpdateUserDto.id, UpdateUserDto)
    }

    @Delete('delete')
    async delete(@Param('id') id: string): Promise<any> { 
        await this.usersService.delete(id)
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async get(): Promise<User[]> { 
        return await this.usersService.findAll()
    }
}
