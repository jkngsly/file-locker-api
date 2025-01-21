import { isEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UploadDTO { 
    @IsString()
    @IsOptional() // If no folderID is provided, the application assumes the root directory of the user's drive
    folderId?: string
}