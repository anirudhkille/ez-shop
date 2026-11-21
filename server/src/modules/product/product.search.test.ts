import assert from "node:assert/strict";
import { describe, it } from "node:test";

import Product from "./product.model.js";
import {
  buildAtlasSearchStage,
  buildPrefixSearchFilter,
  buildTextSearchFilter,
  buildTextSearchSort,
  isAtlasSearchUnavailable,
} from "./product.search.js";

describe("product search", () => {
  it("builds an Atlas autocomplete and fuzzy full-text query", () => {
    const stage = buildAtlasSearchStage("sneaker", "product_search");
    const search = stage.$search as {
      index: string;
      compound: {
        should: unknown[];
        minimumShouldMatch: number;
      };
    };

    assert.equal(search.index, "product_search");
    assert.equal(search.compound.minimumShouldMatch, 1);
    assert.deepEqual(search.compound.should, [
      {
        autocomplete: {
          query: "sneaker",
          path: "name",
          fuzzy: { maxEdits: 1, prefixLength: 2 },
        },
      },
      {
        text: {
          query: "sneaker",
          path: ["description", "slug", "tag"],
          fuzzy: { maxEdits: 1, prefixLength: 2 },
        },
      },
    ]);
  });

  it("anchors prefix matches on the normalized name and escapes regex metacharacters", () => {
    assert.deepEqual(buildPrefixSearchFilter("A.b*"), {
      nameLower: { $regex: "^a\\.b\\*" },
    });
  });

  it("uses the text index for the portable fallback", () => {
    assert.deepEqual(buildTextSearchFilter("running shoes"), {
      $text: { $search: "running shoes" },
    });
  });

  it("sorts text matches by score before the requested sort", () => {
    assert.deepEqual(buildTextSearchSort({ price: 1, _id: 1 }), {
      score: { $meta: "textScore" },
      price: 1,
      _id: 1,
    });
  });

  it("only falls back when Atlas Search itself is unavailable", () => {
    assert.equal(
      isAtlasSearchUnavailable(
        new Error("Unrecognized pipeline stage name: '$search'"),
      ),
      true,
    );
    assert.equal(
      isAtlasSearchUnavailable(
        new Error("Search index product_search not found"),
      ),
      true,
    );
    assert.equal(
      isAtlasSearchUnavailable(
        new Error("Search stages are only allowed on MongoDB Atlas"),
      ),
      true,
    );
    assert.equal(
      isAtlasSearchUnavailable({ code: 6047401, message: "nope" }),
      true,
    );
    assert.equal(
      isAtlasSearchUnavailable(new Error("connection refused")),
      false,
    );
  });

  it("declares text, prefix and compound filter indexes", () => {
    const indexes = new Map(
      Product.schema.indexes().map(([keys, options]) => [options.name, keys]),
    );

    assert.deepEqual(indexes.get("product_text"), {
      name: "text",
      description: "text",
      slug: "text",
      tag: "text",
    });
    assert.deepEqual(indexes.get("product_name_prefix"), { nameLower: 1 });
    assert.deepEqual(indexes.get("product_category_newest"), {
      publish: 1,
      category: 1,
      createdAt: -1,
      _id: 1,
    });
    assert.deepEqual(indexes.get("product_category_price"), {
      publish: 1,
      category: 1,
      price: 1,
      discountPrice: 1,
      _id: 1,
    });
    assert.deepEqual(indexes.get("product_category_price_desc"), {
      publish: 1,
      category: 1,
      price: -1,
      discountPrice: -1,
      _id: 1,
    });
    assert.deepEqual(indexes.get("product_gender_price"), {
      publish: 1,
      gender: 1,
      price: 1,
      discountPrice: 1,
      _id: 1,
    });
    assert.deepEqual(indexes.get("product_size"), {
      publish: 1,
      "variants.sizes.size": 1,
      _id: 1,
    });
    assert.deepEqual(indexes.get("product_color"), {
      publish: 1,
      "variants.color": 1,
      _id: 1,
    });
  });
});
