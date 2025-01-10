import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class UploadFilesDTO { 
    @IsNotEmpty()
    @IsString()
    directory: string;
}