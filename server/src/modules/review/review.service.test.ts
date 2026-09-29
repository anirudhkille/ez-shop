import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toPublicReview } from "./review.service.js";
import type { ReviewWithAuthor } from "./review.model.js";

const authored = (name?: string): ReviewWithAuthor =>
  ({
    _id: "507f191e810c19729de860ea",
    product: "507f191e810c19729de860eb",
    rating: 4,
    comment: "Fits well",
    createdAt: new Date("2026-01-15T10:00:00.000Z"),
    user: { _id: "507f191e810c19729de860ec", name },
  }) as unknown as ReviewWithAuthor;

describe("toPublicReview", () => {
  it("shows the first name and last initial", () => {
    const shaped = toPublicReview(authored("Anirudh Kille"));

    assert.equal(shaped.firstName, "Anirudh");
    assert.equal(shaped.lastInitial, "K.");
  });

  it("never leaks the full name or the user id", () => {
    const shaped = toPublicReview(authored("Anirudh Kille"));

    assert.equal("user" in shaped, false);
    assert.equal(JSON.stringify(shaped).includes("Kille"), false);
  });

  it("handles a single-word name without inventing an initial", () => {
    const shaped = toPublicReview(authored("Cher"));

    assert.equal(shaped.firstName, "Cher");
    assert.equal(shaped.lastInitial, undefined);
  });

  it("falls back to Anonymous when the user has no name", () => {
    assert.equal(toPublicReview(authored(undefined)).firstName, "Anonymous");
  });

  it("keeps the rating, comment and an ISO timestamp", () => {
    const shaped = toPublicReview(authored("Anirudh Kille"));

    assert.equal(shaped.rating, 4);
    assert.equal(shaped.comment, "Fits well");
    assert.equal(shaped.createdAt, "2026-01-15T10:00:00.000Z");
  });
});
