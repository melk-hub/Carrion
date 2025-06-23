import {
  Controller,
  Get,
  Logger,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: "Get the user's profile with his id" })
  @ApiResponse({
    status: 200,
    description: 'Return the user profile',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: any) {
    return await this.userProfileService.getUserProfileByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Create an user profile with its id' })
  @ApiResponse({
    status: 201,
    description: 'User profile created or updated if already exists.',
  })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createUserProfile(@Req() req: any): Promise<object> {
    try {
      console.log('userProfileDto', req.body);
      return {
        message: await this.userProfileService.createUserProfile(
          req.user.id,
          req.body,
        ),
      };
    } catch (error) {
      Logger.error(error.message);
      return { message: 'Error creating user profile' };
    }
  }

  @ApiOperation({ summary: 'Update an user profile with its id' })
  @ApiResponse({
    status: 200,
    description: 'Create the user profile',
  })
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(@Req() req: any) {
    try {
      console.log('userProfileDto', req.body);
      return {
        message: await this.userProfileService.updateUserProfile(
          req.user.id,
          req.body,
        ),
      };
    } catch (error) {
      Logger.error(error.message);
      return { message: 'Error updating user profile' };
    }
  }
}
