import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ConsoleLogger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'NestProj',
      timestamp: true,
    }),
  });

  const configServer = app.get(ConfigService);
  const port = configServer.get<number>('PORT') || 3001;

  // Enable CORS with specific settings
  app.enableCors({
    origin: configServer.get<string>('CLIENT_URL') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 204,
  });

  // Set security-related HTTP headers using Helmet
  app.use(helmet());

  // Set up cookie parser
  const cookieSecret =
    configServer.get<string>('COOKIE_SECRET') || 'default_cookie_secret';
  app.use(cookieParser(cookieSecret));

  // Set up double CSRF protection
  const csrfSecret =
    configServer.get<string>('CSRF_SECRET') || 'default_csrf_secret';
  const csrfTokenKey =
    configServer.get<string>('CSRF_TOKEN_KEY') || '__NestProj-csrf';
  const cookieName = configServer.get<string>('COOKIE_NAME') || 'NESTPROJ';

  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => csrfSecret,
    cookieName: csrfTokenKey,
    getSessionIdentifier: (req: Request) =>
      req.signedCookies?.[cookieName] || 'default_session_id',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
    },
    size: 32,
    hmacAlgorithm: 'HS256',
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  });
  app.use(doubleCsrfProtection);

  // Set global prefix with exclusion for root GET endpoint
  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: '/',
        method: RequestMethod.GET,
      },
    ],
  });

  // Enable API versioning with URI strategy
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1.0',
    prefix: 'v',
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
