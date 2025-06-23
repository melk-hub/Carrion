import { Injectable, Logger } from '@nestjs/common';
import { UserProfileDto } from './dto/user-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfileByUserId(userId: string) {
    return await this.prisma.userProfile.findUnique({
      where: { userId: userId },
    });
  }

  async createUserProfile(
    userId: string,
    userProfileInfo: UserProfileDto,
  ): Promise<string> {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: userId },
      });
      if (userProfile) {
        return await this.updateUserProfile(userId, userProfileInfo);
      }
      await this.prisma.userProfile.create({
        data: {
          ...userProfileInfo,
          userId: userId,
          birthDate: new Date(userProfileInfo.birthDate),
        },
      });
      return 'User profile created';
    } catch (error) {
      Logger.error(error.message);
      return 'Error creating user profile';
    }
  }

  async updateUserProfile(
    userId: string,
    userProfileInfo: UserProfileDto,
  ): Promise<string> {
    try {
      await this.prisma.userProfile.update({
        where: { userId: userId },
        data: {
          ...userProfileInfo,
          birthDate: new Date(userProfileInfo.birthDate),
        },
      });
      return 'User profile updated';
    } catch (error) {
      Logger.error(error.message);
      return 'Error updating user profile';
    }
  }
}
