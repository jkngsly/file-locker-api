import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class UploadFilesDTO { 
    @IsString()
    parentId?: string;
}