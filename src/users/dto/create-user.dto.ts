import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto { 
    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsNotEmpty()
    //@isEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}