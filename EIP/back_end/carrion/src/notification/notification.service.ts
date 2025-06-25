import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';

export enum ApplicationType {
  SUCCESS = 'APPLIED',
  ERROR = 'PENDING',
  INFO = 'INTERVIEW_SCHEDULED',
  WARNING = 'TECHNICAL_TEST',
  DEFAULT = 'DEFAULT'
}

// DTO de création d'une notification
export class CreateNotificationDto {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  company?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  message: string;

  @IsEnum(ApplicationType)
  type: ApplicationType;

  @IsOptional()
  read?: boolean = false;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(
    userId: number,
    type: ApplicationType,
    title: string,
    message: string,
    company?: string,
  ) {
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      message,
      company,
      read: false,
      createdAt: new Date(),
    });

    return await this.notificationRepo.save(notification);
  }

  async findByUser(userId: number) {
    return await this.notificationRepo.find({ where: { userId } });
  }

  async markAsRead(id: number) {
    await this.notificationRepo.update(id, { read: true });
    return { message: 'Notification marked as read' };
  }
}
