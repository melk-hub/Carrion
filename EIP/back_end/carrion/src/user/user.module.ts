import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, JwtModule, ConfigModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, {
    provide: 'CONFIGURATION(refresh-jwt)',
    useValue: process.env.REFRESH_JWT_SECRET,
  }],
})
export class UserModule {}