import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { displayLimitFor } from "@/lib/plan";
import type { WorkspacePlan } from "@/lib/schema";

/**
 * Stripe webhook — keeps each workspace's plan state in sync.
 *
 * Configure the endpoint URL at Stripe → Developers → Webhooks:
 *   https://<your-domain>/api/stripe/webhook
 * Subscribe to:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 * Then paste the signing secret into STRIPE_WEBHOOK_SECRET in .env.local.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET missing" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (e) {
    return NextResponse.json(
      { error: `invalid signature: ${e instanceof Error ? e.message : "?"}` },
      { status: 400 },
    );
  }

  try {
    await handleEvent(event);
  } catch (e) {
    console.error("[stripe webhook]", e);
    // Still 200 so Stripe doesn't spam — we've logged; surface via monitoring.
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      const plan = session.metadata?.plan;
      if (!workspaceId || !plan) return;
      await adminDb().collection("workspaces").doc(workspaceId).update({
        plan,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        displayLimit: displayLimitFor(plan as WorkspacePlan),
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;
      if (!workspaceId) return;
      const patch: Record<string, unknown> = {
        stripeSubscriptionId:
          event.type === "customer.subscription.deleted" ? null : sub.id,
      };
      if (event.type === "customer.subscription.deleted") {
        patch.plan = "free";
        patch.displayLimit = displayLimitFor("free");
      } else if (sub.status === "active" || sub.status === "trialing") {
        const plan = sub.metadata?.plan ?? "studio";
        patch.plan = plan;
        patch.displayLimit = displayLimitFor(plan as WorkspacePlan);
      }
      await adminDb().collection("workspaces").doc(workspaceId).update(patch);
      break;
    }
    default:
      // No-op for unhandled types.
      break;
  }
}
