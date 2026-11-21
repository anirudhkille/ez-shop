import { randomUUID } from "node:crypto";

import StripeEvent, { IStripeEvent } from "@/webhook/stripe-event.model";

/**
 * If a worker dies mid-event, Stripe's retry should be able to pick the event
 * up again. Card events normally finish in seconds; the window is generous so
 * a slow invoice/email path is not processed twice.
 */
const STALE_PROCESSING_MS = 30 * 60 * 1000;

export type StripeEventClaim =
  | { status: "claimed"; token: string }
  | { status: "processed" }
  | { status: "in-progress" };

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === 11000;

const isFreshProcessing = (
  startedAt: Date | null | undefined,
  staleBefore: Date,
) => Boolean(startedAt && startedAt > staleBefore);

/**
 * A processed event must never match, or a duplicate delivery would run its
 * side effects again. Failed events and abandoned processing attempts may.
 * Processing rows without a timestamp are treated as stale so they cannot stay
 * unclaimable forever.
 */
export const claimableFilter = (eventId: string, staleBefore: Date) => ({
  eventId,
  $or: [
    { status: "failed" as const },
    {
      status: "processing" as const,
      $or: [
        { processingStartedAt: { $lte: staleBefore } },
        { processingStartedAt: { $exists: false } },
        { processingStartedAt: null },
      ],
    },
  ],
});

const inspectExisting = async (
  eventId: string,
  staleBefore: Date,
): Promise<StripeEventClaim | null> => {
  const existing = await StripeEvent.findOne({ eventId })
    .select("status processingStartedAt")
    .lean<Pick<IStripeEvent, "status" | "processingStartedAt"> | null>();

  if (!existing) return null;
  if (existing.status === "processed") return { status: "processed" };
  if (
    existing.status === "processing" &&
    isFreshProcessing(existing.processingStartedAt, staleBefore)
  ) {
    return { status: "in-progress" };
  }

  return null;
};

/**
 * Atomically takes ownership of an event. The unique eventId index is the
 * tie-breaker when Stripe delivers the same event twice at the same time.
 */
export const claim = async (
  eventId: string,
  type: string,
  orderId?: string,
): Promise<StripeEventClaim> => {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - STALE_PROCESSING_MS);

  const existing = await inspectExisting(eventId, staleBefore);
  if (existing) return existing;

  const token = randomUUID();

  try {
    const claimed = await StripeEvent.findOneAndUpdate(
      claimableFilter(eventId, staleBefore),
      {
        $set: {
          type,
          status: "processing",
          processingStartedAt: now,
          claimId: token,
          ...(orderId ? { orderId } : {}),
        },
        $inc: { attempts: 1 },
        $unset: { lastError: 1 },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (!claimed) {
      return (
        (await inspectExisting(eventId, staleBefore)) ?? {
          status: "in-progress",
        }
      );
    }

    return { status: "claimed", token };
  } catch (error) {
    // The upsert lost the race to another delivery of the same event.
    if (isDuplicateKeyError(error)) {
      return (
        (await inspectExisting(eventId, staleBefore)) ?? {
          status: "in-progress",
        }
      );
    }
    throw error;
  }
};

export const markProcessed = async (eventId: string, token: string) => {
  const result = await StripeEvent.updateOne(
    { eventId, status: "processing", claimId: token },
    {
      $set: { status: "processed" },
      $unset: { lastError: 1, claimId: 1 },
    },
  );

  return result.matchedCount > 0;
};

export const markFailed = async (
  eventId: string,
  token: string,
  error: Error,
) => {
  const result = await StripeEvent.updateOne(
    { eventId, status: "processing", claimId: token },
    {
      $set: {
        status: "failed",
        lastError: error.message.slice(0, 1000),
      },
      $unset: { claimId: 1 },
    },
  );

  return result.matchedCount > 0;
};
