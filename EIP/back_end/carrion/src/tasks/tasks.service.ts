import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'daily_cleanup' })
  async handleDailyCleanup() {
    this.logger.log('CRON [Daily Cleanup] : Démarrage...', 'TasksService');
    const now = new Date();

    try {
      const { count: resetCount } = await this.prisma.user.updateMany({
        where: {
          passwordResetExpires: { lt: now },
          passwordResetToken: { not: null },
        },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      const { count: verifyCount } = await this.prisma.user.updateMany({
        where: {
          verificationExpires: { lt: now },
          verificationToken: { not: null },
          isEmailVerified: false,
        },
        data: {
          verificationToken: null,
          verificationExpires: null,
        },
      });

      const { count: inviteCount } =
        await this.prisma.organizationInvitation.deleteMany({
          where: {
            expiresAt: { lt: now },
          },
        });

      if (resetCount > 0 || verifyCount > 0 || inviteCount > 0) {
        this.logger.log(
          `CRON [Daily Cleanup] Terminé : ${resetCount} resets nettoyés, ${verifyCount} vérifs nettoyées, ${inviteCount} invitations supprimées.`,
          'TasksService',
        );
      } else {
        this.logger.log(
          "CRON [Daily Cleanup] : Rien à nettoyer aujourd'hui.",
          'TasksService',
        );
      }
    } catch (error) {
      this.logger.error(
        'CRON [Daily Cleanup] : Erreur critique',
        error.stack,
        'TasksService',
      );
    }
  }
}
