import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createFolderDTO { 
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsString()
    parentId?: string;
}