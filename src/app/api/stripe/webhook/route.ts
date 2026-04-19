import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { PRICE_IDS, stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { displayLimitFor } from "@/lib/plan";
import { WorkspacePlanSchema, type WorkspacePlan } from "@/lib/schema";

/**
 * Stripe webhook — keeps each workspace's plan state in sync.
 *
 * Event handling is idempotent: every successfully-processed event.id is
 * recorded in stripeEvents/{id}. A retry for the same event short-circuits.
 * Unexpected failures return 500 so Stripe retries.
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

  // Idempotency: create the event record first. If it already exists, this is
  // a retry and we short-circuit with 200.
  const eventRef = adminDb().collection("stripeEvents").doc(event.id);
  try {
    await eventRef.create({
      type: event.type,
      receivedAt: new Date(),
    });
  } catch {
    // Already processed — Stripe retry after a 500 we've since recovered from,
    // or a duplicate delivery. Ack.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(event);
    await eventRef.update({ processedAt: new Date(), status: "ok" });
    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[stripe webhook]", event.id, event.type, message);
    // Delete the dedupe record so Stripe's retry reprocesses cleanly.
    await eventRef.delete().catch(() => {});
    return NextResponse.json(
      { error: "processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Map a Stripe price ID back to the workspace plan. Prefer this over
 * subscription metadata which an operator or future self-serve flow could
 * drop or tamper with.
 */
function planFromPriceId(priceId: string | null | undefined): WorkspacePlan | null {
  if (!priceId) return null;
  if (priceId === PRICE_IDS.studio()) return "studio";
  if (priceId === PRICE_IDS.venue()) return "venue";
  return null;
}

function firstPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  return item?.price?.id ?? null;
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (!workspaceId) {
        console.warn("[stripe webhook] missing workspaceId", event.id);
        return;
      }

      // Derive plan from the subscription's line items, not session metadata.
      const subId = session.subscription as string | null;
      let plan: WorkspacePlan | null = null;
      if (subId) {
        const sub = await stripe().subscriptions.retrieve(subId);
        plan = planFromPriceId(firstPriceId(sub));
      }
      // Fall back to metadata only if the price lookup failed, and validate.
      if (!plan) {
        const parsed = WorkspacePlanSchema.safeParse(session.metadata?.plan);
        plan = parsed.success ? parsed.data : null;
      }
      if (!plan || plan === "free") {
        console.warn("[stripe webhook] could not resolve plan", event.id);
        return;
      }

      await adminDb().collection("workspaces").doc(workspaceId).update({
        plan,
        stripeSubscriptionId: subId,
        stripeCustomerId: session.customer as string,
        displayLimit: displayLimitFor(plan),
      });
      return;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;
      if (!workspaceId) {
        console.warn("[stripe webhook] subscription missing workspaceId", event.id);
        return;
      }

      const patch: Record<string, unknown> = {
        stripeSubscriptionId:
          event.type === "customer.subscription.deleted" ? null : sub.id,
      };

      if (event.type === "customer.subscription.deleted") {
        patch.plan = "free";
        patch.displayLimit = displayLimitFor("free");
      } else if (sub.status === "active" || sub.status === "trialing") {
        const plan =
          planFromPriceId(firstPriceId(sub)) ??
          (WorkspacePlanSchema.safeParse(sub.metadata?.plan).data ?? null);
        if (!plan) {
          console.warn("[stripe webhook] could not resolve plan", event.id);
          return;
        }
        patch.plan = plan;
        patch.displayLimit = displayLimitFor(plan);
      } else {
        // past_due, unpaid, incomplete_expired, paused — don't silently downgrade;
        // leave existing plan in place and log for operator reconciliation.
        console.warn(
          "[stripe webhook] subscription in non-active status",
          event.id,
          sub.status,
        );
        return;
      }

      await adminDb().collection("workspaces").doc(workspaceId).update(patch);
      return;
    }

    default:
      // No-op for unhandled types; still recorded as processed.
      return;
  }
}
