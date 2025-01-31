import { isEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UploadDTO { 
    @IsString()
    folderId?: string
}