import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createDriveDTO { 
    @IsNotEmpty()
    @IsString()
    name: string;
}