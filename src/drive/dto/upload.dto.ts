import { isEmail, IsNotEmpty, IsString } from 'class-validator'

export class UploadDTO { 
    @IsString()
    folderId?: string
}