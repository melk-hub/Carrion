import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserProfileDto } from './dto/user-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfileByUserId(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: userId },
    });
    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }
    return profile;
  }

  async createOrUpdateProfile(
    userId: string,
    userProfileInfo: UserProfileDto,
  ): Promise<string> {
    try {
      const data = {
        ...userProfileInfo,
        birthDate: userProfileInfo.birthDate
          ? new Date(userProfileInfo.birthDate)
          : null,
      };

      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: userId },
      });

      if (userProfile) {
        await this.prisma.userProfile.update({ where: { userId }, data });
        return 'User profile updated';
      } else {
        await this.prisma.userProfile.create({ data: { ...data, userId } });
        await this.prisma.user.update({
          where: { id: userId },
          data: { hasProfile: true },
        });
        return 'User profile created';
      }
    } catch (error) {
      Logger.error(error.message, 'UserProfileService');
      throw new Error('Error creating or updating user profile');
    }
  }
}
