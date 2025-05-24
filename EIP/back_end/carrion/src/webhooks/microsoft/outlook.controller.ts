import { Controller, Get, Post, Query, Body, Res, Req, HttpException, HttpStatus, HttpCode, All } from '@nestjs/common';
import { Response, Request } from 'express';
import { OutlookService } from './outlook.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('webhook/outlook')
export class OutlookController {
  constructor(private readonly outlookService: OutlookService) {}

  @HttpCode(HttpStatus.OK)
  @All()
  @Post()
  async handleNotification(@Query('validationToken') getToken: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    const postToken = body?.validationToken;

    if (getToken || postToken) {
      const token = getToken || postToken;
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(token);
    }

    if (!body?.value || !Array.isArray(body.value)) {
      throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
    }
    for (const notification of body.value) {
      const { clientState, resourceData } = notification;

      if (clientState !== `${process.env.WEBHOOK_VALIDATION_TOKEN}`) {
        console.warn('Invalid clientState received in webhook:', clientState);
        continue;
      }

      try {
        const token = await this.outlookService.getTokenForUser(notification.subscriptionId);
        const message = await this.outlookService.fetchMessage(resourceData.id, token.accessToken);
        console.log('New Email Received:\nSubject:', message.subject, '\nBody:', message.body?.content);
        //ICI METTRE FILTRE SUR VARIABLE MESSAGE
      } catch (err) {
        console.error('Failed to fetch message:', err.message);
      }
    }

    res.status(202).send();
  }
}
