import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { Request } from 'express';

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile.',
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    const profile =
      await this.userProfileService.getUserProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }
    return profile;
  }

  @ApiOperation({ summary: 'Create or update the user profile' })
  @ApiResponse({
    status: 201,
    description: 'User profile created or updated successfully.',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdateUserProfile(
    @Req() req: Request,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<object> {
    try {
      const userId = (req.user as any).id;

      const message = await this.userProfileService.createOrUpdateProfile(
        userId,
        userProfileDto,
      );
      return { message };
    } catch (error) {
      Logger.error(error.message, 'UserProfileController');
      return { message: 'Error saving user profile' };
    }
  }
}
