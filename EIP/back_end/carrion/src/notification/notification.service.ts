import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return notifications.map((n) => ({
      ...n,
      hoursAgo: Math.floor((now.getTime() - n.createdAt.getTime()) / 3600000),
    }));
  }

  async toggleReadStatus(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found for user');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        "You don't have permission to update this job application.",
      );
    }

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { read: !notification.read },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found for user');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        "You don't have permission to update this job application.",
      );
    }

    await this.prisma.notification.delete({
      where: { id: notification.id },
    });

    return { success: true };
  }

  async createNotification(data: {
    userId: string;
    company: string;
    title: string;
    type: 'POSITIVE' | 'NEGATIVE' | 'INFO' | 'WARNING';
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        company: data.company,
        title: data.title,
        type: data.type,
        message: data.message,
      },
    });
  }
}
