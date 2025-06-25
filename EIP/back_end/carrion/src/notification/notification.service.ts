// notification.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found for user');
    }
    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { read: !notification.read },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const deleted = await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Notification not found or not owned by user');
    }
    return { success: true };
  }
}
