import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './users/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  console.log('🌐 CORS enabled for ALL origins');

  // Configurar CORS para permitir todos los orígenes
  app.enableCors({
    origin: true, // Permite todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Servir archivos estáticos desde la raíz del proyecto
  app.useStaticAssets(join(__dirname, '..'), {
    prefix: '/',
  });
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(new ValidationPipe());
  const openapiconfig = new DocumentBuilder()
    .setTitle('QuizifyAPI')
    .setDescription(
      'Aplicación Web que usa un LLM para la Creación de Ejercicios Interactivos ',
    )
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Token JWT para autenticación',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, openapiconfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, documentFactory);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();