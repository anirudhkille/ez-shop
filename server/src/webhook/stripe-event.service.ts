import * as stripeEventRepository from "@/webhook/stripe-event.repository";

export interface StripeEventStore {
  claim(eventId: string, type: string, orderId?: string): Promise<unknown>;
  markProcessed(eventId: string): Promise<unknown>;
  markFailed(eventId: string, error: Error): Promise<unknown>;
}

const store: StripeEventStore = {
  claim: stripeEventRepository.claim,
  markProcessed: stripeEventRepository.markProcessed,
  markFailed: stripeEventRepository.markFailed,
};

export type StripeEventResult = "processed" | "duplicate";

/**
 * Runs an event's side effects at most once. A duplicate delivery is returned
 * without invoking the handler; a failed event is marked failed and rethrown so
 * Stripe retries it.
 */
export const processStripeEvent = async (
  event: { id: string; type: string; orderId?: string },
  handle: () => Promise<void>,
  eventStore: StripeEventStore = store,
): Promise<StripeEventResult> => {
  const claimed = await eventStore.claim(event.id, event.type, event.orderId);

  if (!claimed) return "duplicate";

  try {
    await handle();
  } catch (error) {
    const failure = error instanceof Error ? error : new Error(String(error));

    try {
      await eventStore.markFailed(event.id, failure);
    } catch {
      // If the failure marker cannot be written, the stale-processing window
      // lets a later Stripe retry reclaim the event.
    }

    throw failure;
  }

  await eventStore.markProcessed(event.id);

  return "processed";
};
