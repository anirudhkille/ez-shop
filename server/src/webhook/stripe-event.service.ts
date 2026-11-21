import * as stripeEventRepository from "@/webhook/stripe-event.repository";
import type { StripeEventClaim } from "@/webhook/stripe-event.repository";

export interface StripeEventStore {
  claim(
    eventId: string,
    type: string,
    orderId?: string,
  ): Promise<StripeEventClaim>;
  markProcessed(eventId: string, token: string): Promise<boolean>;
  markFailed(eventId: string, token: string, error: Error): Promise<boolean>;
}

const store: StripeEventStore = {
  claim: stripeEventRepository.claim,
  markProcessed: stripeEventRepository.markProcessed,
  markFailed: stripeEventRepository.markFailed,
};

export type StripeEventResult = "processed" | "in-progress";

/**
 * Runs an event's side effects at most once. A processed duplicate is ACKed;
 * an event owned by another worker returns "in-progress" so the webhook can
 * ask Stripe to retry instead of silently dropping a crashed attempt.
 */
export const processStripeEvent = async (
  event: { id: string; type: string; orderId?: string },
  handle: () => Promise<void>,
  eventStore: StripeEventStore = store,
): Promise<StripeEventResult> => {
  const claim = await eventStore.claim(event.id, event.type, event.orderId);

  if (claim.status === "processed") return "processed";
  if (claim.status === "in-progress") return "in-progress";

  try {
    await handle();
  } catch (error) {
    const failure = error instanceof Error ? error : new Error(String(error));

    try {
      await eventStore.markFailed(event.id, claim.token, failure);
    } catch {
      // If the failure marker cannot be written, the stale-processing window
      // lets a later Stripe retry reclaim the event.
    }

    throw failure;
  }

  await eventStore.markProcessed(event.id, claim.token);

  return "processed";
};
