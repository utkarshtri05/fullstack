import { getDb } from "@/db";
import { auditLogs, subscriptions, userCharity, type Subscription } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { requiredEnv } from "@/lib/env";
import { AppError, conflict, notFound } from "../shared/errors";
import { checkoutSchema, type CheckoutInput } from "./schemas";

type StripeSubscriptionStatus = Stripe.Subscription.Status;

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_MONTHLY_PRICE_ID &&
      process.env.STRIPE_YEARLY_PRICE_ID
  );
}

export function mapStripeSubscriptionStatus(status: StripeSubscriptionStatus): Subscription["status"] {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }

  if (status === "canceled") {
    return "canceled";
  }

  return "incomplete";
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
  const value = (subscription as unknown as { current_period_end?: number }).current_period_end;
  if (!value) {
    return new Date();
  }

  return new Date(value * 1000);
}

function inferPlanType(subscription: Stripe.Subscription): "monthly" | "yearly" {
  const metadataPlan = subscription.metadata?.planType;

  if (metadataPlan === "monthly" || metadataPlan === "yearly") {
    return metadataPlan;
  }

  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
    return "yearly";
  }

  return "monthly";
}

async function findUserIdForCustomer(customerId: string) {
  const [subscription] = await getDb()
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId))
    .limit(1);

  return subscription?.userId ?? null;
}

export async function createCheckoutSession(userId: string, email: string, input: CheckoutInput) {
  if (!isStripeConfigured()) {
    throw new AppError("Stripe billing is not configured for this deployment", 503, "billing_unavailable");
  }

  const values = checkoutSchema.parse(input);
  const stripe = getStripe();
  const priceId = values.plan === "yearly" ? requiredEnv("STRIPE_YEARLY_PRICE_ID") : requiredEnv("STRIPE_MONTHLY_PRICE_ID");
  const existing = await getDb().select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

  if (existing[0]?.status === "active" && existing[0].currentPeriodEnd.getTime() > Date.now()) {
    throw conflict("You already have an active subscription");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: existing[0] ? undefined : email,
    customer: existing[0]?.stripeCustomerId,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    subscription_data: {
      metadata: {
        userId,
        planType: values.plan
      }
    },
    metadata: {
      userId,
      planType: values.plan
    },
    success_url: absoluteUrl("/dashboard?billing=success"),
    cancel_url: absoluteUrl("/dashboard?billing=cancelled"),
    allow_promotion_codes: true
  });

  return session;
}

export async function createBillingPortalSession(subscription: Subscription) {
  if (!isStripeConfigured()) {
    throw new AppError("Stripe billing is not configured for this deployment", 503, "billing_unavailable");
  }

  const stripe = getStripe();
  const returnPath = process.env.STRIPE_BILLING_PORTAL_RETURN_PATH ?? "/dashboard";

  return stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: absoluteUrl(returnPath)
  });
}

export async function syncStripeSubscription(subscription: Stripe.Subscription, fallbackUserId?: string | null) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = subscription.metadata?.userId ?? fallbackUserId ?? (await findUserIdForCustomer(customerId));

  if (!userId) {
    throw notFound("Subscription owner");
  }

  const values = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    planType: inferPlanType(subscription),
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodEnd: currentPeriodEnd(subscription)
  };

  const [row] = await getDb()
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: values.stripeCustomerId,
        stripeSubscriptionId: values.stripeSubscriptionId,
        planType: values.planType,
        status: values.status,
        currentPeriodEnd: values.currentPeriodEnd
      }
    })
    .returning();

  return row;
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!isStripeConfigured()) {
    return null;
  }

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (!subscriptionId) {
    return null;
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  return syncStripeSubscription(subscription, session.metadata?.userId ?? session.client_reference_id);
}

export async function recordCharityContributionsForInvoice(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const amountPaid = invoice.amount_paid ?? 0;

  if (!customerId || amountPaid <= 0) {
    return null;
  }

  const [subscription] = await getDb()
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.stripeCustomerId, customerId), eq(subscriptions.status, "active")))
    .limit(1);

  if (!subscription) {
    return null;
  }

  const allocations = await getDb().select().from(userCharity).where(eq(userCharity.userId, subscription.userId));

  if (allocations.length === 0) {
    return null;
  }

  const contributions = allocations.map((allocation) => ({
    charityId: allocation.charityId,
    percentage: allocation.percentage,
    amount: Math.floor((amountPaid * allocation.percentage) / 100)
  }));

  const [audit] = await getDb()
    .insert(auditLogs)
    .values({
      action: "charity.contributions.recorded",
      actorId: subscription.userId,
      metadata: {
        invoiceId: invoice.id,
        amountPaid,
        contributions
      }
    })
    .returning();

  return audit;
}
