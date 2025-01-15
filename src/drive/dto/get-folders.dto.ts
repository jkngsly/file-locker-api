import { IsOptional, IsString } from "class-validator";

export class GetFoldersDTO {
    @IsString()
    @IsOptional()
    id?: string;
  }