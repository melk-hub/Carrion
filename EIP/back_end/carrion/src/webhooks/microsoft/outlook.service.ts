import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Token } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OutlookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchMessage(messageId: string, accessToken: string): Promise<any> {
    const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}`;

    const response$ = this.httpService.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const response = await firstValueFrom(response$);
    return response.data;
  }

  async getTokenForUser(subscriptionId: string): Promise<Token> {
    return await this.prisma.token.findFirst({
      where: { user: { historyId: subscriptionId }, name: 'Microsoft_oauth2' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
