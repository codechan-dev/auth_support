// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Disable auto-sync; use migrations instead
      migrations: ['dist/migrations/*{.ts,.js}'],
    }),
  
    UserModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
