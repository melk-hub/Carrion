import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CustomLoggingService } from 'src/common/services/logging.service';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { CustomLoggingService } from 'src/common/services/logging.service';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    PrismaModule,
    forwardRef(() => AuthModule),
    HttpModule,
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
