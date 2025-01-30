import { APP_GUARD, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as session from 'express-session'
import * as cors from 'cors'
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'
import RequestValidationPipe from '@/pipes/request-validation.pipe'
//import { LoggingInterceptor } from 'src/drive/interceptors/logging.interceptor'
import { ResponseInterceptor } from '@/interceptors/response-payload.interceptor';
import { AllExceptionsFilter } from '@/http/exception-filter'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { JwtService } from '@nestjs/jwt'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(__dirname, '..', 'public'))

  // DTO validation for all controller methods
  app.useGlobalPipes(RequestValidationPipe);
  
  // Standard response payload format, including exceptions
  app.useGlobalInterceptors(new ResponseInterceptor());
  //app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cors())

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
