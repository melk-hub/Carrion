import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CustomLoggingService } from '@/common/services/logging.service';
import { AuthService } from '@/auth/auth.service';
import { S3Module } from '@/aws/s3.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    PrismaModule,
    forwardRef(() => AuthModule),
    HttpModule,
    forwardRef(() => S3Module),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    JwtService,
    CustomLoggingService,
    {
      provide: 'CONFIGURATION(refresh-jwt)',
      useValue: process.env.REFRESH_JWT_SECRET,
    },
  ],
  exports: [UserService, CustomLoggingService],
})
export class UserModule {}
