import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private prismaService: PrismaService
  ) {
    this.bucket = this.configService.get('AWS_BUCKET_NAME');
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async getSignedUploadUrl(userId: string, filename: string, contentType: string) {
    const key = `users/${userId}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    //await this.userService.addDocument(userId, filename); // à rajouter plus tard. pour l'instant on peut avoir que 1 cv et 1 photo de profil
    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    if (filename == "profile") {
      await this.prismaService.userProfile.update({
        where: { userId },
        data: {
          imageUrl: key,
        }
      });
    } else if (filename == "cv") {
      await this.prismaService.userProfile.update({
        where: {userId},
        data: {
          resume: key,
        }
      });
    } else {
      throw new BadRequestException('Filename must be "profile" or "cv"');
    }
    return { signedUrl };
  }

  async getSignedDownloadUrl(userId: string, filename: string) {
    const response = await this.prismaService.userProfile.findUnique({
      where: {userId},
      select: {imageUrl: true},
    });
    if (!response?.imageUrl)
      return null;
    const key = `users/${userId}/${filename}`;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { signedUrl };
  }
}
