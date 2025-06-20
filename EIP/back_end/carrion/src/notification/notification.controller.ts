import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() body: { userId: number; message: string }) {
    return this.notificationsService.create(body.userId, body.message);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  @Patch('read/:id')
  markAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsRead(id);
  }
}
