import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [JwtModule, ConfigModule, PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, JwtService, {
    provide: 'CONFIGURATION(refresh-jwt)',
    useValue: process.env.REFRESH_JWT_SECRET,
  }],
})
export class UserModule {}