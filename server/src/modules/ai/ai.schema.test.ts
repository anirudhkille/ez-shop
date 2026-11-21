import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  productStudioInputSchema,
  productStudioOutputSchema,
} from "./ai.schema.js";

describe("AI product studio schemas", () => {
  it("requires a name, description, or image", () => {
    assert.equal(productStudioInputSchema.safeParse({}).success, false);
    assert.equal(
      productStudioInputSchema.safeParse({ name: "Trail Runner" }).success,
      true,
    );
    assert.equal(
      productStudioInputSchema.safeParse({
        image: "https://cdn.example.com/product.jpg",
      }).success,
      true,
    );
  });

  it("rejects non-http image URLs and oversized briefs", () => {
    assert.equal(
      productStudioInputSchema.safeParse({
        name: "Trail Runner",
        image: "javascript:alert(1)",
      }).success,
      false,
    );
    assert.equal(
      productStudioInputSchema.safeParse({
        name: "Trail Runner",
        brief: "x".repeat(601),
      }).success,
      false,
    );
  });

  it("accepts the structured content the model must return", () => {
    const result = productStudioOutputSchema.safeParse({
      name: "Trail Runner",
      description: "A lightweight running shoe built for daily training.",
      tag: "New",
      gender: "unisex",
      imageAlt: "Black trail running shoe with a textured sole",
      seoTitle: "Trail Runner | EZ Shop",
      seoDescription:
        "Shop the Trail Runner at EZ Shop. A lightweight running shoe built for daily training and everyday comfort.",
      keywords: ["trail runner", "running shoe", "ez shop"],
    });

    assert.equal(result.success, true);
  });

  it("rejects invalid tags and incomplete content", () => {
    assert.equal(
      productStudioOutputSchema.safeParse({
        name: "Trail Runner",
        description: "A lightweight running shoe.",
        tag: "Unknown",
        gender: "unisex",
        imageAlt: "A shoe",
        seoTitle: "Trail Runner",
        seoDescription: "A lightweight running shoe.",
        keywords: ["trail runner"],
      }).success,
      false,
    );
  });
});
