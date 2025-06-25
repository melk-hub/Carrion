import { Controller, Get, Delete, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Successfully got user notifcations' })
  @ApiResponse({ status: 400, description: "Can't get user notifications" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAll(@Req() req) {
    const userId = req.user.id;
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Toggle notification as read' })
  @ApiResponse({ status: 200, description: 'Succesfully toggled notifications as read' })
  @ApiResponse({ status: 400, description: "Can't toggle notification as read" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.toggleReadStatus(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Successfully deleted notification' })
  @ApiResponse({ status: 400, description: "Can't delete notification" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.deleteNotification(id, userId);
  }
}
