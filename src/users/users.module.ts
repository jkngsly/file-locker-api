import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '@/users/users.service';
import { User } from '@/database/user.entity';
import { UsersController } from '@/users/users.controller';
import { DriveModule } from '@/drive/drive.module';
import { DriveService } from '@/drive/services/drive.service';
import { RequestContext } from 'src/common/request-context.service';
import { FoldersService } from '@/drive/services/folders.service';
import { Folder } from '@/database/folder.entity';
import { Drive } from '@/database/drive.entity';
import { FileStorage } from '@flystorage/file-storage';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Folder, Drive]),
  ],
  providers: [UsersService, RequestContext, DriveService, FileStorage, FoldersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
