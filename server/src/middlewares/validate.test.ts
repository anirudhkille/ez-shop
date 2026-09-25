import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import type { Request, Response } from "express";
import { z } from "zod";

import { validate } from "./validate.js";

class MockResponse {
  statusCode?: number;
  body?: unknown;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(body: unknown): this {
    this.body = body;
    return this;
  }
}

const createRequest = (request: {
  body: Request["body"];
  params: Request["params"];
  query: Request["query"];
}): Request => request as Request;

describe("validate", () => {
  it("validates and replaces the request body by default", () => {
    const schema = z.object({
      age: z.coerce.number().int(),
      name: z.string().transform((name) => name.trim()),
    });
    const request = createRequest({
      body: { age: "42", name: "  Ada  " },
      params: {},
      query: {},
    });
    const response = new MockResponse();
    const next = mock.fn();

    validate(schema)(request, response as unknown as Response, next);

    assert.deepEqual(request.body, { age: 42, name: "Ada" });
    assert.equal(next.mock.callCount(), 1);
  });

  it("coerces and replaces the request query when requested", () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
    });
    const request = createRequest({
      body: { ignored: true },
      params: {},
      query: { page: "2" },
    });
    Object.defineProperty(request, "query", {
      configurable: true,
      enumerable: true,
      get: () => ({ page: "2" }),
    });
    const response = new MockResponse();
    const next = mock.fn();

    validate(schema, "query")(request, response as unknown as Response, next);

    assert.deepEqual(request.query, { page: 2 });
    assert.deepEqual(request.body, { ignored: true });
    assert.equal(next.mock.callCount(), 1);
  });

  it("validates and replaces the request params when requested", () => {
    const schema = z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    });
    const request = createRequest({
      body: {},
      params: { id: "42" },
      query: {},
    });
    const response = new MockResponse();
    const next = mock.fn();

    validate(schema, "params")(request, response as unknown as Response, next);

    assert.deepEqual(request.params, { id: 42 });
    assert.equal(next.mock.callCount(), 1);
  });

  it("returns a 400 response and does not continue on validation failure", () => {
    const schema = z.object({
      profile: z.object({
        email: z.string().email("Invalid email"),
      }),
    });
    const request = createRequest({
      body: { profile: { email: "not-an-email" } },
      params: {},
      query: {},
    });
    const response = new MockResponse();
    const next = mock.fn();

    validate(schema)(request, response as unknown as Response, next);

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, {
      success: false,
      message: "Invalid email",
      error: "Validation error",
      details: [{ field: "profile.email", message: "Invalid email" }],
    });
    assert.equal(next.mock.callCount(), 0);
  });
});
