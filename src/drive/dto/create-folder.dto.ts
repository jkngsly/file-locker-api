import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createFolderDTO { 
    @IsString()
    parentId?: string

    @IsNotEmpty()
    @IsString()
    name: string
}