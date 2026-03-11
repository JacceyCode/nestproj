import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import 'dotenv/config';
// import { DataSource, DataSourceOptions } from 'typeorm';

// export const dataSourceOptions: DataSourceOptions = {
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
//   username: process.env.DB_USERNAME || 'postgres',
//   password: process.env.DB_PASSWORD || 'password',
//   database: process.env.DB_NAME || 'default_db',
//   entities: ['dist/**/*.entity.js'],
//   synchronize: process.env.NODE_ENV === 'development', // Set to false in production
//   migrations: ['dist/database/migrations/*.js'],
// };

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'default_db'),
    entities: ['dist/**/*.entity.js'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    migrations: ['dist/database/migrations/*.js'],
  }),
};

// const dataSource = new DataSource(dataSourceOptions);
// export default dataSource;
