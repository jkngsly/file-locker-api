import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as session from 'express-session'
import * as cors from 'cors'
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'
import RequestValidationPipe from 'src/pipes/RequestValidation.pipe'
//import { LoggingInterceptor } from 'src/drive/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.useGlobalPipes(RequestValidationPipe);
    
  app.use(
    cors(),

    // TODO: auth
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),

    // TODO: middleware
    (req, res, next) => {
      if (!req.session.initialized) {
        req.session.initialized = true 
        req.session.defaultData = {
          userId: 'bbb1adf5-bfbc-45ec-a131-61c97595e8be',
          driveId: 'c44ec9ac-09aa-4cca-b26c-f9ac3a2d741f'
        }
      }
      next()
  })

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
