import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateFileDto { 
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    //@isEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}