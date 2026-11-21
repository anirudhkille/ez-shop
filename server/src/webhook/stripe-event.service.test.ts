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
  lastError?: string;
};

/** Minimal in-memory stand-in for the unique eventId collection. */
const createMemoryStore = () => {
  const events = new Map<string, StoredEvent>();

  const store: StripeEventStore = {
    async claim(eventId) {
      const existing = events.get(eventId);

      if (
        existing?.status === "processed" ||
        existing?.status === "processing"
      ) {
        return null;
      }

      const claimed: StoredEvent = {
        status: "processing",
        attempts: (existing?.attempts ?? 0) + 1,
      };
      events.set(eventId, claimed);
      return claimed;
    },

    async markProcessed(eventId) {
      const event = events.get(eventId);
      if (event) events.set(eventId, { ...event, status: "processed" });
    },

    async markFailed(eventId, error) {
      const event = events.get(eventId);
      if (event) {
        events.set(eventId, {
          ...event,
          status: "failed",
          lastError: error.message,
        });
      }
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

    assert.equal(result, "duplicate");
    assert.equal(handled, 0);
  });

  it("does not run the handler while the same event is being processed", async () => {
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

    assert.equal(result, "duplicate");
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
});

describe("claimableFilter", () => {
  it("only reclaims failed or stale processing events", () => {
    const staleBefore = new Date("2026-01-01T00:00:00.000Z");

    assert.deepEqual(claimableFilter("evt_123", staleBefore), {
      eventId: "evt_123",
      $or: [
        { status: "failed" },
        {
          status: "processing",
          processingStartedAt: { $lte: staleBefore },
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
