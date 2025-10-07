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
  
  // Construir lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3011',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3011',
    'http://127.0.0.1:8080',
    // Frontend de producción (todas las variaciones)
    'https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me',
    'https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me:3011',
    'http://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me',
    'http://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me:3011',
  ];

  // Agregar orígenes desde variable de entorno si existe
  if (process.env.CORS_ORIGINS) {
    const envOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...envOrigins);
  }

  console.log('🌐 CORS enabled for origins:', allowedOrigins);

  // Configurar CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) {
        console.log('✅ CORS: Allowing request without origin');
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Blocking origin: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
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