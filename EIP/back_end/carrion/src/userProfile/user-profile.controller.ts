import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Logger,
  NotFoundException,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { Request } from 'express';

@ApiTags('user-profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile.',
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @Get()
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

  @ApiOperation({ summary: 'Get the user services list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user services list.',
  })
  @Get('services')
  async getUserServicesList(@Req() req: Request) {
    const userId = (req.user as any).id;
    const services = await this.userProfileService.getUserServicesList(userId);
    return services;
  }

  @Delete('services/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect all services from the user account' })
  async disconnectAllServices(@Req() req: Request) {
    const userId = (req.user as any).id;
    await this.userProfileService.disconnectAllServices(userId);
  }

  @Delete('services/:serviceName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Disconnect a single service from the user account',
  })
  async disconnectService(
    @Req() req: Request,
    @Param('serviceName') serviceName: string,
  ) {
    const userId = (req.user as any).id;
    const validServices = ['Google_oauth2', 'Microsoft_oauth2'];
    if (validServices.includes(serviceName)) {
      await this.userProfileService.disconnectService(userId, serviceName);
    }
  }

  @ApiOperation({ summary: "Get the current user's profile picture" })
  @ApiResponse({
    status: 200,
    description: "Returns the user's profile picture.",
  })
  @ApiResponse({ status: 404, description: 'Profile picture not found.' })
  @Get('imageUrl')
  async getUserProfilePicture(@Req() req: Request) {
    const userId = req.query.userId || (req.user as any).id;
    const profilePicture =
      await this.userProfileService.getUserProfilePicture(userId);

    if (!profilePicture) {
      throw new NotFoundException('User profile picture not found.');
    }
    return profilePicture;
  }
}
