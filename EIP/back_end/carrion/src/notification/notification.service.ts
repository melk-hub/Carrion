import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(userId: number, message: string) {
    const notification = this.notificationRepo.create({ userId, message });
    return await this.notificationRepo.save(notification);
  }

  async findByUser(userId: number) {
    return await this.notificationRepo.find({ where: { userId } });
  }

  async markAsRead(id: number) {
    await this.notificationRepo.update(id, { isRead: true });
    return { message: 'Notification marked as read' };
  }
}
