import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildProductStudioMessages,
  generateProductStudio,
  parseProductStudioResult,
} from "./product-studio.service.js";

const validResult = {
  name: "Trail Runner",
  description:
    "A lightweight trail running shoe with a grippy outsole and breathable upper for daily training.",
  tag: "New",
  gender: "unisex",
  imageAlt: "Black trail running shoe with a textured rubber sole",
  seoTitle: "Trail Runner Running Shoe | EZ Shop",
  seoDescription:
    "Shop the Trail Runner at EZ Shop. A lightweight running shoe with a grippy outsole and breathable upper for daily training.",
  keywords: ["trail runner", "running shoe", "ez shop"],
};

const config = {
  apiKey: "test-key",
  baseUrl: "https://ai.example.com/v1",
  model: "test-model",
  visionEnabled: true,
  timeoutMs: 5_000,
};

const completion = (content: string, status = 200) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("product studio service", () => {
  it("builds a structured prompt and includes the product image", () => {
    const messages = buildProductStudioMessages(
      {
        name: "Trail Runner",
        category: "Shoes",
        price: 120,
        colors: ["Black"],
        sizes: ["M", "L"],
        image: "https://cdn.example.com/trail.jpg",
        brief: "Focus on trail running",
      },
      true,
    );

    assert.match(messages[0].content as string, /Return a single JSON object/);
    assert.equal(messages[1].role, "user");

    const content = messages[1].content as Array<Record<string, unknown>>;
    assert.equal(content[1].type, "image_url");
    assert.deepEqual(content[1].image_url, {
      url: "https://cdn.example.com/trail.jpg",
    });
  });

  it("parses JSON wrapped in markdown fences", () => {
    const result = parseProductStudioResult(
      `Here you go:\n\`\`\`json\n${JSON.stringify(validResult)}\n\`\`\``,
    );

    assert.equal(result.name, "Trail Runner");
    assert.equal(result.keywords.length, 3);
  });

  it("throws a 503 when the AI key is missing", async () => {
    await assert.rejects(
      () =>
        generateProductStudio(
          { name: "Trail Runner" },
          {
            config: { ...config, apiKey: "" },
            fetchImpl: (async () => {
              throw new Error("fetch should not be called");
            }) as typeof fetch,
          },
        ),
      (error: { statusCode?: number }) => error.statusCode === 503,
    );
  });

  it("calls an OpenAI-compatible endpoint and returns validated content", async () => {
    let requestedUrl = "";
    let requestBody: Record<string, unknown> = {};

    const result = await generateProductStudio(
      {
        name: "Trail Runner",
        image: "https://cdn.example.com/trail.jpg",
      },
      {
        config,
        fetchImpl: (async (input: unknown, init?: RequestInit) => {
          requestedUrl = String(input);
          requestBody = JSON.parse(String(init?.body));
          return completion(JSON.stringify(validResult));
        }) as typeof fetch,
      },
    );

    assert.equal(requestedUrl, "https://ai.example.com/v1/chat/completions");
    assert.equal(requestBody.model, "test-model");
    assert.deepEqual(requestBody.response_format, { type: "json_object" });
    assert.equal(result.seoTitle, "Trail Runner Running Shoe | EZ Shop");
  });

  it("retries without JSON mode when the provider rejects response_format", async () => {
    let calls = 0;
    const bodies: Array<Record<string, unknown>> = [];

    const result = await generateProductStudio(
      { name: "Trail Runner" },
      {
        config,
        fetchImpl: (async (_input: unknown, init?: RequestInit) => {
          calls++;
          const body = JSON.parse(String(init?.body));
          bodies.push(body);

          if (calls === 1) {
            return new Response("unsupported response_format", { status: 400 });
          }

          return completion(JSON.stringify(validResult));
        }) as typeof fetch,
      },
    );

    assert.equal(calls, 2);
    assert.equal("response_format" in bodies[1], false);
    assert.equal(result.name, "Trail Runner");
  });

  it("retries without the image when a text-only model rejects vision", async () => {
    let calls = 0;
    const bodies: Array<Record<string, unknown>> = [];

    const result = await generateProductStudio(
      {
        name: "Trail Runner",
        image: "https://cdn.example.com/trail.jpg",
      },
      {
        config,
        fetchImpl: (async (_input: unknown, init?: RequestInit) => {
          calls++;
          const body = JSON.parse(String(init?.body));
          bodies.push(body);

          if (calls < 3) {
            return new Response("image input is not supported", {
              status: 400,
            });
          }

          return completion(JSON.stringify(validResult));
        }) as typeof fetch,
      },
    );

    assert.equal(calls, 3);
    const finalUser = (bodies[2].messages as Array<{ content: unknown }>)[1]
      .content;
    assert.equal(typeof finalUser, "string");
    assert.equal(result.name, "Trail Runner");
  });

  it("rejects malformed model output", async () => {
    await assert.rejects(
      () =>
        generateProductStudio(
          { name: "Trail Runner" },
          {
            config,
            fetchImpl: (async () =>
              completion(
                JSON.stringify({ ...validResult, tag: "Not a tag" }),
              )) as typeof fetch,
          },
        ),
      (error: { statusCode?: number }) => error.statusCode === 502,
    );
  });
});
