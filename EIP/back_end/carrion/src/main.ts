import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthService } from './auth/auth.service';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter to prevent server crashes
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  
  // Configure body parser to preserve raw body for Stripe webhooks
  app.use('/subscription/webhook', json({ 
    verify: (req: any, res, buf) => {
      if (buf && buf.length) {
        req.rawBody = Buffer.from(buf);
      }
      return true;
    }
  }));

  // Configure body parser to preserve raw body for Stripe webhooks
  app.use(
    '/subscription/webhook',
    json({
      verify: (req: any, res, buf) => {
        if (buf && buf.length) {
          req.rawBody = Buffer.from(buf);
        }
        return true;
      },
    }),
  );

  app.use(json());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      // Helper function to clean URLs (remove trailing slashes and paths)
      const cleanOrigin = (url: string | undefined): string | undefined => {
        if (!url) return undefined;
        try {
          const urlObj = new URL(url);
          return `${urlObj.protocol}//${urlObj.host}`;
        } catch {
          return url.replace(/\/+$/, '').replace(/\/api.*$/, '');
        }
      };

      // Build allowed origins list, cleaning them to remove paths
      const allowedOrigins = [
        cleanOrigin(process.env.FRONT),
        cleanOrigin(process.env.BACK), // Remove /api from BACK
        cleanOrigin(process.env.DOMAIN_NAME),
        cleanOrigin(process.env.DOMAIN_NAME_WWW),
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ].filter(Boolean) as string[]; // Remove undefined values

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Always log CORS errors for debugging (important for production issues)
        console.error(`[CORS] Blocked origin: ${origin}`);
        console.error(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
        console.error(`[CORS] Environment variables - FRONT: ${process.env.FRONT}, BACK: ${process.env.BACK}, DOMAIN_NAME: ${process.env.DOMAIN_NAME}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const config = new DocumentBuilder()
    .setTitle('API Carrion')
    .setDescription(
      'The documentation of the routes defined for the web appliaction Carrion',
    )
    .addBearerAuth()
    .addCookieAuth('access_token')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT);

  // Initialize webhook monitoring after the app starts
  try {
    const authService = app.get(AuthService);
    if (
      authService &&
      typeof authService.initializeWebhookMonitoring === 'function'
    ) {
      await authService.initializeWebhookMonitoring();
      console.log('Webhook monitoring initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize webhook monitoring:', error.message);
  }
}
bootstrap();
