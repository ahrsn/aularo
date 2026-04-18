import "server-only";
import Stripe from "stripe";

/**
 * Stripe client. Used server-side only — never import into a client bundle.
 * STRIPE_SECRET_KEY must be set in .env.local. For webhooks, set
 * STRIPE_WEBHOOK_SECRET to the signing secret from your endpoint.
 */

let _client: Stripe | null = null;

export function stripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing in env");
  _client = new Stripe(key);
  return _client;
}

/**
 * Stripe price IDs per plan. Fill STRIPE_PRICE_STUDIO / STRIPE_PRICE_VENUE
 * in .env.local after creating products in Stripe.
 */
export const PRICE_IDS = {
  studio: () => process.env.STRIPE_PRICE_STUDIO ?? null,
  venue: () => process.env.STRIPE_PRICE_VENUE ?? null,
} as const;

export type StripePlan = keyof typeof PRICE_IDS;

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}
