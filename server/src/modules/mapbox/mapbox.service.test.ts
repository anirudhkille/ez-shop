import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

const originalFetch = globalThis.fetch;
let requestedUrl = "";

let suggestAddresses!: typeof import("./mapbox.service.js").suggestAddresses;
let retrieveAddress!: typeof import("./mapbox.service.js").retrieveAddress;

const mockFetch = (body: unknown, status = 200) => {
  globalThis.fetch = (async (input: unknown) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
};

describe("mapbox service", () => {
  before(async () => {
    process.env.MAPBOX_TOKEN = "test-token";
    const service = await import("./mapbox.service.js");
    suggestAddresses = service.suggestAddresses;
    retrieveAddress = service.retrieveAddress;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it("maps suggestions and keeps the access token server-side", async () => {
    mockFetch({
      suggestions: [
        {
          mapbox_id: "dXJuOm1ieHBsYzpi",
          name: "MG Road",
          name_preferred: "Mahatma Gandhi Road",
          feature_type: "street",
          full_address: "MG Road, Bengaluru, Karnataka, India",
          place_formatted: "Bengaluru, Karnataka, India",
        },
      ],
    });

    const suggestions = await suggestAddresses("MG Road", "session-123");

    assert.deepEqual(suggestions, [
      {
        mapboxId: "dXJuOm1ieHBsYzpi",
        primaryText: "Mahatma Gandhi Road",
        secondaryText: "Bengaluru, Karnataka, India",
        fullAddress: "MG Road, Bengaluru, Karnataka, India",
        featureType: "street",
      },
    ]);

    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get("access_token"), "test-token");
    assert.equal(url.searchParams.get("session_token"), "session-123");
    assert.equal(url.searchParams.get("q"), "MG Road");
  });

  it("resolves a feature into address fields", async () => {
    mockFetch({
      features: [
        {
          properties: {
            address: "12 MG Road",
            name: "12 MG Road",
            context: {
              country: { name: "India" },
              region: { name: "Karnataka", region_code: "KA" },
              postcode: { name: "560001" },
              place: { name: "Bengaluru" },
              locality: { name: "Bengaluru" },
            },
          },
        },
      ],
    });

    const address = await retrieveAddress("dXJuOm1ieHBsYzpi", "session-123");

    assert.deepEqual(address, {
      addressLine1: "12 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    });

    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get("access_token"), "test-token");
    assert.equal(url.searchParams.get("session_token"), "session-123");
    assert.ok(url.pathname.endsWith("/retrieve/dXJuOm1ieHBsYzpi"));
  });

  it("skips the request for short queries", async () => {
    globalThis.fetch = (async () => {
      throw new Error("fetch should not be called");
    }) as typeof fetch;

    assert.deepEqual(await suggestAddresses("MG", "session-123"), []);
  });
});
