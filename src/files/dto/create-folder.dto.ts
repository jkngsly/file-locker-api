import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createFolderDTO { 
    @IsNotEmpty()
    @IsString()
    driveId: string

    @IsString()
    parentId?: string

    @IsNotEmpty()
    @IsString()
    name: string
}