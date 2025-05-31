import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService
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

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { signedUrl, key };
  }

  async getSignedDownloadUrl(userId: string, filename: string) {
    const key = `users/${userId}/${filename}`;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { signedUrl };
  }
}
