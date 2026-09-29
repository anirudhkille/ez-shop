import assert from "node:assert/strict";
import { describe, it } from "node:test";

import mongoose from "mongoose";

import { reviewUpdate } from "./review.repository.js";

describe("reviewUpdate", () => {
  it("sets rating and comment when both are supplied", () => {
    const update = reviewUpdate({ rating: 4, comment: "Fits well" });

    assert.deepEqual(update.$set, { rating: 4, comment: "Fits well" });
    assert.equal(update.$unset, undefined);
  });

  it("unsets a stale comment rather than leaving it attached to a new rating", () => {
    // Mongoose strips undefined keys out of $set, so a reviewer changing their
    // rating without retyping a comment would otherwise keep the old text
    // contradicting the new score.
    const update = reviewUpdate({ rating: 2 });

    assert.deepEqual(update.$set, { rating: 2 });
    assert.deepEqual(update.$unset, { comment: 1 });
  });

  it("unsets rather than writes an empty string", () => {
    const update = reviewUpdate({ rating: 3, comment: "" });

    assert.equal(update.$set?.comment, undefined);
    assert.deepEqual(update.$unset, { comment: 1 });
  });

  it("leaves the rating alone when only the comment changes", () => {
    const update = reviewUpdate({ comment: "Updated" });

    assert.deepEqual(update.$set, { comment: "Updated" });
    assert.equal(update.$unset, undefined);
  });

  it("survives Mongoose's undefined-stripping cast", async () => {
    // The original bug only appears once Mongoose has processed the update, so
    // assert on the post-cast shape rather than the object we passed in.
    const Review = mongoose.model(
      "ReviewUpdateCast",
      new mongoose.Schema({
        product: mongoose.Schema.Types.ObjectId,
        user: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
      }),
    );

    const query = Review.findOneAndUpdate(
      {},
      reviewUpdate({ rating: 1 }) as never,
      { new: true },
    );

    const cast = query.getUpdate() as { $set: unknown; $unset: unknown };
    assert.deepEqual(cast.$set, { rating: 1 });
    assert.deepEqual(cast.$unset, { comment: 1 });

    mongoose.deleteModel("ReviewUpdateCast");
  });
});
