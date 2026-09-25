import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Response } from "express";

import { sendResponse } from "./response.js";

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

const createResponse = () => new MockResponse();

describe("sendResponse", () => {
  it("returns success, message and data", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response, 200, "Success", { id: 1 });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      success: true,
      message: "Success",
      data: { id: 1 },
    });
  });

  it("derives success from the status code", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response, 201, "Created", { id: 1 });
    assert.equal((response.body as { success: boolean }).success, true);

    sendResponse(response as unknown as Response, 404, "Not found");
    assert.equal((response.body as { success: boolean }).success, false);

    sendResponse(response as unknown as Response, 500, "Boom");
    assert.equal((response.body as { success: boolean }).success, false);
  });

  it("defaults message and data", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response);

    assert.deepEqual(response.body, {
      success: true,
      message: "Success",
      data: {},
    });
  });

  it("keeps pagination as a sibling of data for an object payload", () => {
    const response = createResponse();
    const pagination = { total: 1, page: 1, limit: 10, totalPages: 1 };

    sendResponse(
      response as unknown as Response,
      200,
      "User fetched successfully",
      { id: 1, name: "Ada" },
      pagination,
    );

    assert.deepEqual(response.body, {
      success: true,
      message: "User fetched successfully",
      data: { id: 1, name: "Ada" },
      pagination,
    });
  });

  it("returns an array as data with pagination alongside it", () => {
    const response = createResponse();
    const pagination = { total: 1, page: 1, limit: 10, totalPages: 1 };

    sendResponse(
      response as unknown as Response,
      200,
      "Users fetched successfully",
      [{ id: 1 }],
      pagination,
    );

    assert.deepEqual(response.body, {
      success: true,
      message: "Users fetched successfully",
      data: [{ id: 1 }],
      pagination,
    });
  });

  it("leaves a bare array payload untouched without pagination", () => {
    const response = createResponse();

    sendResponse(
      response as unknown as Response,
      200,
      "Users fetched successfully",
      [{ id: 1 }],
    );

    assert.deepEqual(response.body, {
      success: true,
      message: "Users fetched successfully",
      data: [{ id: 1 }],
    });
  });

  it("omits pagination entirely when it is not supplied", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response, 200, "Success", { id: 1 });

    assert.deepEqual(Object.keys(response.body as object).sort(), [
      "data",
      "message",
      "success",
    ]);
  });

  it("carries an error code inside data", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response, 401, "Not authorized", {
      code: "UNAUTHORIZED",
    });

    assert.deepEqual(response.body, {
      success: false,
      message: "Not authorized",
      data: { code: "UNAUTHORIZED" },
    });
  });

  it("never emits a top-level error key", () => {
    const response = createResponse();

    sendResponse(response as unknown as Response, 400, "Validation failed", {
      code: "VALIDATION_ERROR",
      details: [{ field: "email", message: "Required" }],
    });

    assert.deepEqual(Object.keys(response.body as object).sort(), [
      "data",
      "message",
      "success",
    ]);
  });
});
