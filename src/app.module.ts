import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Load environment variables from .env file and make them globally available
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate Limiter Module
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // Time to live in milliseconds (1 minute)
          limit: 5, // Maximum number of requests within the ttl
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiter guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
