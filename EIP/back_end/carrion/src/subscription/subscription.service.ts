import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

// Alias pour éviter le conflit avec le type Prisma Subscription
type StripeSubscriptionType = Stripe.Subscription;

@Injectable()
export class SubscriptionService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        this.logger.error('STRIPE_SECRET_KEY is not configured');
        throw new InternalServerErrorException('Stripe configuration is missing');
      }
      this.stripe = new Stripe(stripeSecretKey);
    }
    return this.stripe;
  }

  async createCheckoutSession(userId: string, userEmail: string) {
    try {
      // Vérifier si l'utilisateur a déjà une souscription
      let subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      // Si pas de souscription, en créer une
      if (!subscription) {
        subscription = await this.prisma.subscription.create({
          data: {
            userId,
            status: 'INACTIVE',
          },
        });
      }

      // Créer ou récupérer le customer Stripe
      let customerId = subscription.stripeCustomerId;
      const stripe = this.getStripe();

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });

        customerId = customer.id;

        // Mettre à jour la souscription avec le customer ID
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }

      // Créer la session Checkout
      const frontendUrl = this.configService.get<string>('FRONT');
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Carrion Premium',
                description: 'Accès premium à toutes les fonctionnalités de Carrion',
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: 999, // 9.99 EUR en centimes
            },
            quantity: 1,
          },
        ],
        success_url: `${frontendUrl}/?subscription=success`,
        cancel_url: `${frontendUrl}/?subscription=cancelled`,
        metadata: {
          userId: userId,
        },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw new InternalServerErrorException(
        'Failed to create checkout session',
      );
    }
  }

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutCompleted(session);
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdate(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.warn('No userId in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      this.logger.warn('No subscription ID in checkout session');
      return;
    }

    // Récupérer la souscription Stripe pour obtenir les détails
    const stripe = this.getStripe();
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionId,
    );

    await this.updateSubscriptionFromStripe(userId, stripeSubscription);
  }

  private async handleSubscriptionUpdate(
    subscription: StripeSubscriptionType,
  ) {
    const customerId = subscription.customer as string;
    const subscriptionRecord = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscriptionRecord) {
      this.logger.warn(
        `No subscription found for customer: ${customerId}`,
      );
      return;
    }

    await this.updateSubscriptionFromStripe(
      subscriptionRecord.userId,
      subscription,
    );
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ) {
    const customerId = subscription.customer as string;
    const subscriptionRecord = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscriptionRecord) {
      this.logger.warn(
        `No subscription found for customer: ${customerId}`,
      );
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionRecord.id },
      data: {
        status: 'CANCELED',
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
  }

  private async updateSubscriptionFromStripe(
    userId: string,
    stripeSubscription: StripeSubscriptionType,
  ) {
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      canceled: 'CANCELED',
      past_due: 'PAST_DUE',
      unpaid: 'INACTIVE',
      trialing: 'ACTIVE',
    };

    const status =
      statusMap[stripeSubscription.status] || 'INACTIVE';

    // Accès direct aux propriétés Stripe via indexation pour éviter le conflit de types
    const periodEnd = (stripeSubscription as any).current_period_end as number | null;

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: stripeSubscription.id,
        status: status as any,
        currentPeriodEnd: periodEnd
          ? new Date(periodEnd * 1000)
          : null,
      },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { status: 'INACTIVE', hasSubscription: false };
    }

    return {
      status: subscription.status,
      hasSubscription: subscription.status === 'ACTIVE',
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }
}

