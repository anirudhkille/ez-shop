import StripeEvent from "@/webhook/stripe-event.model";

/**
 * If a worker dies mid-event, Stripe's retry should be able to pick the event
 * up again. The order-level claim flags still prevent a second stock deduction.
 */
const STALE_PROCESSING_MS = 5 * 60 * 1000;

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === 11000;

/**
 * A processed event must never match, or a duplicate delivery would run its
 * side effects again. Failed events and abandoned processing attempts may.
 */
export const claimableFilter = (eventId: string, staleBefore: Date) => ({
  eventId,
  $or: [
    { status: "failed" as const },
    {
      status: "processing" as const,
      processingStartedAt: { $lte: staleBefore },
    },
  ],
});

/**
 * Atomically takes ownership of an event. The unique eventId index is the
 * tie-breaker when Stripe delivers the same event twice at the same time.
 *
 * Returns the claimed record, or null when the event is already processed or
 * another worker currently owns it.
 */
export const claim = async (
  eventId: string,
  type: string,
  orderId?: string,
) => {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - STALE_PROCESSING_MS);

  try {
    return await StripeEvent.findOneAndUpdate(
      claimableFilter(eventId, staleBefore),
      {
        $set: {
          type,
          status: "processing",
          processingStartedAt: now,
          ...(orderId ? { orderId } : {}),
        },
        $inc: { attempts: 1 },
        $unset: { lastError: 1 },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  } catch (error) {
    // The upsert lost the race to another delivery of the same event.
    if (isDuplicateKeyError(error)) return null;
    throw error;
  }
};

export const markProcessed = async (eventId: string) => {
  return await StripeEvent.updateOne(
    { eventId },
    { $set: { status: "processed" }, $unset: { lastError: 1 } },
  );
};

export const markFailed = async (eventId: string, error: Error) => {
  return await StripeEvent.updateOne(
    { eventId },
    {
      $set: {
        status: "failed",
        lastError: error.message.slice(0, 1000),
      },
    },
  );
};
