import { Expose } from 'class-transformer'
import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDTO { 
    @IsNotEmpty()
    @IsString()
    id: string

    @IsString()
    @Expose({ name: 'firstName' })
    first_name: string

    @IsString()
    @Expose({ name: 'lastName' })
    last_name: string

    //@isEmail()
    email: string

}