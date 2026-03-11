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
import { ArtistModule } from './artist/artist.module';
import { UserModule } from './user/user.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { AuthModule } from './auth/auth.module';
import { typeOrmAsyncConfig } from 'database/data-source';
import { SeedModule } from './seed/seed.module';

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
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    SongsModule,
    ArtistModule,
    UserModule,
    PlaylistsModule,
    AuthModule,
    SeedModule,
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
