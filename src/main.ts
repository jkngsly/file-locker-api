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
import { UserInterceptor } from 'src/common/user.interceptor'
import { RequestContext } from 'src/common/request-context.service'
import { UsersService } from '@/users/users.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(__dirname, '..', 'public'))

  app.use(cors())
  app.useGlobalInterceptors(
    new UserInterceptor(await app.resolve(RequestContext), app.get(UsersService)),
    new ResponseInterceptor()
  );

  // DTO validation for all controller methods
  app.useGlobalPipes(RequestValidationPipe);
  //app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
