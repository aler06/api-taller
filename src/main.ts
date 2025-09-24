import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './users/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(new ValidationPipe());
  const openapiconfig = new DocumentBuilder()
    .setTitle('QuizifyAPI')
    .setDescription(
      'Aplicación Web que usa un LLM para la Creación de Ejercicios Interactivos ',
    )
    .setVersion('0.0.1')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, openapiconfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, documentFactory);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();