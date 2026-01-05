import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Res,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCookieAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@ApiTags('Subscription')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckoutSession(@Request() req, @Res() res) {
    try {
      const userId = req.user.id;
      
      // Récupérer l'email depuis la base de données
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const result = await this.subscriptionService.createCheckoutSession(
        userId,
        user.email,
      );
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create checkout session',
        error: error.message,
      });
    }
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      return { error: 'STRIPE_SECRET_KEY is not configured' };
    }

    if (!webhookSecret) {
      return { error: 'STRIPE_WEBHOOK_SECRET is not configured' };
    }

    const stripe = new Stripe(stripeSecretKey);

    let event: Stripe.Event;

    try {
      const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      return { error: `Webhook signature verification failed: ${err.message}` };
    }

    await this.subscriptionService.handleWebhook(event);

    return { received: true };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription status' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
  })
  async getSubscriptionStatus(@Request() req) {
    return this.subscriptionService.getSubscriptionStatus(req.user.id);
  }
}

