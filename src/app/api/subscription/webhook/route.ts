import { recordCharityContributionsForInvoice, handleCheckoutCompleted, syncStripeSubscription } from "@/modules/billing/service";
import { AppError, toErrorResponse } from "@/modules/shared/errors";
import { requiredEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      throw new AppError("Missing Stripe signature", 400, "missing_signature");
    }

    const payload = await request.text();
    const event = getStripe().webhooks.constructEvent(payload, signature, requiredEnv("STRIPE_WEBHOOK_SECRET"));

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await recordCharityContributionsForInvoice(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
