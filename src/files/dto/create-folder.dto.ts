import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createFolderDTO { 
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsString()
    parentId?: string;
}