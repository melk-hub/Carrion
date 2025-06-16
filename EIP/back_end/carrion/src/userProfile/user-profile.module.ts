import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserProfileService],
  exports: [UserProfileService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
