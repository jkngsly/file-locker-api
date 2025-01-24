import { Expose } from 'class-transformer'
import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto { 
    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'firstName' })
    first_name: string

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'lastName' })
    last_name: string

    @IsNotEmpty()
    //@isEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}