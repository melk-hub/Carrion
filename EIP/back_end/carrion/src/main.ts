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

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        `${process.env.FRONT}`,
        `${process.env.BACK}`,
        `${process.env.DOMAIN_NAME}`,
        `${process.env.DOMAIN_NAME_WWW}`,
        'localhost:8080',
      ];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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
