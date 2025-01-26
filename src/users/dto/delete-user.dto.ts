import { IsString } from "class-validator"

export class DeleteUserDTO { 
    @IsString()
    id: string
}