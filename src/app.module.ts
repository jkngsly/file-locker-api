import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AutomapperModule } from '@automapper/nestjs'
import { classes } from '@automapper/classes'
import { FilesModule } from './files/files.module'

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
