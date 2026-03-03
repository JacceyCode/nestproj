import {
  ConsoleLogger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { SongsController } from './songs/songs.controller';
import { DevConfigService } from './common/providers/DevConfigService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Song } from './songs/song.entity';

@Module({
  imports: [
    // Load environment variables from .env file and make them globally available
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate Limiter Module
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('RATE_LIMIT_TTL', 60000), // Time to live in milliseconds (1 minute)
            limit: config.get<number>('RATE_LIMIT_MAX', 5), // Maximum number of requests within the ttl
          },
        ],
      }),
    }),
    // TypeOrm
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'default_db'),
        entities: [Song],
        synchronize:
          config.get<string>('NODE_ENV', 'development') === 'development', // Set to false in production
      }),
    }),
    SongsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiter guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: DevConfigService,
      useClass: DevConfigService,
    },
  ],
})
export class AppModule implements NestModule {
  private readonly logger = new ConsoleLogger(AppModule.name, {
    prefix: 'NestProj',
    timestamp: true,
  });

  constructor(private dataSource: DataSource) {
    this.logger.log(
      `🎯🎯🎯 Database has been initialized! 🔂🔂🔂 ${this.dataSource.isInitialized} 🔂🔂🔂 ${this.dataSource.driver.database}`,
    );
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(SongsController);
  }
}
