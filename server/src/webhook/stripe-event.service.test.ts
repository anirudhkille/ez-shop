import assert from "node:assert/strict";
import { describe, it } from "node:test";

import StripeEvent from "./stripe-event.model.js";
import { claimableFilter } from "./stripe-event.repository.js";
import {
  processStripeEvent,
  type StripeEventStore,
} from "./stripe-event.service.js";

type StoredEvent = {
  status: "processing" | "processed" | "failed";
  attempts: number;
  claimId?: string;
  lastError?: string;
};

/** Minimal in-memory stand-in for the unique eventId collection. */
const createMemoryStore = () => {
  const events = new Map<string, StoredEvent>();
  let nextToken = 0;

  const store: StripeEventStore = {
    async claim(eventId) {
      const existing = events.get(eventId);

      if (existing?.status === "processed") return { status: "processed" };
      if (existing?.status === "processing") return { status: "in-progress" };

      const token = `claim_${++nextToken}`;
      events.set(eventId, {
        status: "processing",
        attempts: (existing?.attempts ?? 0) + 1,
        claimId: token,
      });
      return { status: "claimed", token };
    },

    async markProcessed(eventId, token) {
      const event = events.get(eventId);
      if (event?.claimId !== token) return false;

      events.set(eventId, {
        ...event,
        status: "processed",
        claimId: undefined,
      });
      return true;
    },

    async markFailed(eventId, token, error) {
      const event = events.get(eventId);
      if (event?.claimId !== token) return false;

      events.set(eventId, {
        ...event,
        status: "failed",
        claimId: undefined,
        lastError: error.message,
      });
      return true;
    },
  };

  return { events, store };
};

const event = { id: "evt_123", type: "payment_intent.succeeded" };

describe("processStripeEvent", () => {
  it("processes a new event once and records it as processed", async () => {
    const { events, store } = createMemoryStore();
    let handled = 0;

    const result = await processStripeEvent(
      event,
      async () => {
        handled += 1;
      },
      store,
    );

    assert.equal(result, "processed");
    assert.equal(handled, 1);
    assert.equal(events.get(event.id)?.status, "processed");
  });

  it("does not run the handler again for an already processed event", async () => {
    const { events, store } = createMemoryStore();
    events.set(event.id, { status: "processed", attempts: 1 });
    let handled = 0;

    const result = await processStripeEvent(
      event,
      async () => {
        handled += 1;
      },
      store,
    );

    assert.equal(result, "processed");
    assert.equal(handled, 0);
  });

  it("reports an in-progress event so Stripe retries it", async () => {
    const { events, store } = createMemoryStore();
    events.set(event.id, { status: "processing", attempts: 1 });
    let handled = 0;

    const result = await processStripeEvent(
      event,
      async () => {
        handled += 1;
      },
      store,
    );

    assert.equal(result, "in-progress");
    assert.equal(handled, 0);
  });

  it("retries an event that failed previously", async () => {
    const { events, store } = createMemoryStore();
    events.set(event.id, {
      status: "failed",
      attempts: 1,
      lastError: "temporary failure",
    });
    let handled = 0;

    const result = await processStripeEvent(
      event,
      async () => {
        handled += 1;
      },
      store,
    );

    assert.equal(result, "processed");
    assert.equal(handled, 1);
    assert.equal(events.get(event.id)?.status, "processed");
    assert.equal(events.get(event.id)?.attempts, 2);
  });

  it("marks the event failed and rethrows when the handler fails", async () => {
    const { events, store } = createMemoryStore();
    const failure = new Error("stock update failed");

    await assert.rejects(
      processStripeEvent(
        event,
        async () => {
          throw failure;
        },
        store,
      ),
      failure,
    );

    const stored = events.get(event.id);
    assert.equal(stored?.status, "failed");
    assert.equal(stored?.lastError, failure.message);
  });

  it("does not let a stale owner overwrite a newer claim", async () => {
    const { events, store } = createMemoryStore();
    events.set(event.id, {
      status: "processing",
      attempts: 1,
      claimId: "claim_new",
    });

    const result = await processStripeEvent(event, async () => {}, {
      ...store,
      claim: async () => ({ status: "claimed", token: "claim_old" }),
    });

    assert.equal(result, "processed");
    assert.equal(events.get(event.id)?.status, "processing");
    assert.equal(events.get(event.id)?.claimId, "claim_new");
  });
});

describe("claimableFilter", () => {
  it("reclaims failed, stale and un-timestamped processing events", () => {
    const staleBefore = new Date("2026-01-01T00:00:00.000Z");

    assert.deepEqual(claimableFilter("evt_123", staleBefore), {
      eventId: "evt_123",
      $or: [
        { status: "failed" },
        {
          status: "processing",
          $or: [
            { processingStartedAt: { $lte: staleBefore } },
            { processingStartedAt: { $exists: false } },
            { processingStartedAt: null },
          ],
        },
      ],
    });
  });
});

describe("StripeEvent model", () => {
  it("enforces a unique eventId in MongoDB", () => {
    const indexes = StripeEvent.schema.indexes();

    assert.ok(
      indexes.some(
        ([fields, options]) => fields.eventId === 1 && options.unique === true,
      ),
    );
  });
});
