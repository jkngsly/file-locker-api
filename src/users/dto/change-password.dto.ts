import { Expose } from 'class-transformer'
import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class ChangePassword { 
    @IsString()
    password: string

    @IsString()
    confirmPassword: string
}