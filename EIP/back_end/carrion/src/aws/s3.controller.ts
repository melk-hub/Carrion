import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { Request } from 'express';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async getUploadUrl(
    @Req() req: Request,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const userId = req.user['id'];
    return this.s3Service.getSignedUploadUrl(userId, filename, contentType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('download')
  async getDownloadUrl(
    @Req() req: Request,
    @Query('filename') filename: string,
  ) {
    const userId = req.user['id'];
    return this.s3Service.getSignedDownloadUrl(userId, filename);
  }
}
