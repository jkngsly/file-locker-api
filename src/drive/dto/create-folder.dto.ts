import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class createFolderDTO { 
    //TODO: remove for dev @IsNotEmpty()
    @IsString()
    driveId: string

    @IsString()
    parentId?: string

    @IsNotEmpty()
    @IsString()
    name: string
}