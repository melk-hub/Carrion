import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UserProfileDto } from './dto/user-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';

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
      let returnMessage = '';
      const profileData = {
        ...userProfileInfo,
        birthDate: userProfileInfo.birthDate
          ? new Date(userProfileInfo.birthDate)
          : null,
      };

      const existingProfile = await this.prisma.userProfile.findUnique({
        where: { userId: userId },
      });

      if (existingProfile) {
        await this.prisma.userProfile.update({
          where: { userId },
          data: { ...profileData },
        });
        Logger.log('Updated');
        returnMessage = 'User profile updated';
      } else {
        await this.prisma.userProfile.create({
          data: { ...profileData, userId },
        });
        returnMessage = 'User profile created';
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { hasProfile: true },
      });
      return returnMessage;
    } catch (error) {
      Logger.error(
        `Error during profile creation/update for user ${userId}: ${error.message}`,
        'UserProfileService',
      );

      throw new Error(
        `Error creating or updating user profile: ${error.message}`,
      );
    }
  }

  async getUserServicesList(userId: string) {
    const tokens = await this.prisma.token.findMany({
      where: {
        userId,
      },
      select: { id: true, name: true },
    });
    return {
      services: tokens,
    };
  }

  async disconnectService(userId: string, serviceName: string): Promise<void> {
    await this.prisma.token.deleteMany({
      where: {
        userId: userId,
        name: serviceName,
      },
    });
  }

  async disconnectAllServices(userId: string): Promise<void> {
    await this.prisma.token.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  async getUserProfilePicture(userId: string) {
    const profilePicture = await this.prisma.userProfile.findUnique({
      where: { userId: userId },
      select: { imageUrl: true },
    });
    return profilePicture;
  }
}
