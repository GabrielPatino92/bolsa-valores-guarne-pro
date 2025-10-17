import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // =============  SEGURIDAD: Helmet con configuración estricta =============
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // ============= SEGURIDAD: CORS configurado correctamente =============
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3004',
      'http://localhost:3000',
      'http://localhost:19006',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(compression());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ============= SEGURIDAD: Validación global estricta =============
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true,   // Rechaza requests con propiedades extra
      transform: true,              // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Oculta detalles en producción
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Guarne Pro API')
    .setDescription('API REST profesional con arquitectura de microservicios')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y 2FA')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Providers', 'Proveedores y conexiones')
    .addTag('Market Data', 'Datos de mercado')
    .addTag('Trading', 'Órdenes y posiciones')
    .addTag('Backtesting', 'Motor de backtesting')
    .addTag('Competitions', 'Competencias')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000, '0.0.0.0');
  
  console.log('╔════════════════════════════════════════╗');
  console.log('║  🚀 Guarne Pro API                    ║');
  console.log('║  📚 Docs: http://localhost:3000/api/docs');
  console.log('║  🌎 Zona: America/Bogota              ║');
  console.log('║  ⚠️  DEV - Testnet/Paper only          ║');
  console.log('╚════════════════════════════════════════╝');
}

bootstrap();
