import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cors()); 
  app.useStaticAssets(join(__dirname, '..', 'public')); 

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
