/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ConsoleLogger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { SeedService } from './seed/seed.service';

declare const module: any;

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

  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
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

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF protection for development environment and test routes
    if (process.env.NODE_ENV === 'development' || req.path.includes('/test')) {
      return next();
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const token = generateCsrfToken(req, res);

      res.cookie(csrfTokenKey, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
      });
    }

    doubleCsrfProtection(req, res, next);
  });

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

  // Add ClassSerializerInterceptor globally (helps to apply class transformer on all entity objects)
  // Using it to delete password out of user object when fetched alongside the @Exclude() decorator on the password field
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Seed database with initial data (optional, can be removed in production)
  // const seedService = app.get(SeedService);
  // await seedService.seed();

  // Swagger docs setup
  const config = new DocumentBuilder()
    .setTitle('Nest Project API')
    .setDescription('The Nest Project API description')
    .setVersion('1.0')
    .addTag('nestproj')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
        description: 'Enter JWT token in header to access protected routes',
      },
      'JWT-auth-header',
    )
    .addCookieAuth(
      configServer.get<string>('COOKIE_NAME') || 'nestproj',
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'cookie',
        name: configServer.get<string>('COOKIE_NAME') || 'nestproj',
        description: 'JWT token stored in cookie for authentication',
      },
      configServer.get<string>('COOKIE_NAME') || 'nestproj',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port);

  // Hot reloading
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
