import http from "k6/http";

import { API } from "./config.js";
import { rateLimited, serverErrors, unauthorized } from "./metrics.js";

// By default k6 counts every 4xx as a failed request, which would make
// http_req_failed meaningless in tests that deliberately provoke 400/401/403.
// So each request declares the statuses it expects; anything else is a failure.
const DEFAULT_EXPECTED = http.expectedStatuses({ min: 200, max: 399 });

export function parse(res) {
  try {
    return res.json();
  } catch (_err) {
    return null;
  }
}

/** Case-insensitive response header lookup (k6 canonicalises header names). */
export function header(res, name) {
  const wanted = name.toLowerCase();
  const keys = Object.keys(res.headers || {});

  for (let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === wanted) return res.headers[keys[i]];
  }

  return undefined;
}

function toQueryString(query) {
  const parts = [];

  Object.keys(query).forEach((key) => {
    const value = query[key];
    if (value === undefined || value === null) return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });

  return parts.length ? `?${parts.join("&")}` : "";
}

/**
 * Single entry point for every API call.
 *
 * opts.name    static label for the request (keeps metric cardinality low
 *              when the path contains ids). Always pass one for dynamic paths.
 * opts.token   bearer access token
 * opts.body    JS value, sent as JSON
 * opts.rawBody sent verbatim (for malformed/oversized payload tests)
 * opts.query   object turned into a query string
 * opts.expect  status code, {min,max}, or an array of them that are not failures
 * opts.tags    extra tags to attach to the request's metrics
 */
export function request(method, path, opts = {}) {
  const {
    body,
    rawBody,
    token,
    name,
    query,
    headers = {},
    expect,
    tags = {},
    timeout,
  } = opts;

  const url = `${API}${path}${query ? toQueryString(query) : ""}`;
  const reqHeaders = Object.assign({ Accept: "application/json" }, headers);

  if (token) reqHeaders.Authorization = `Bearer ${token}`;

  let payload = null;

  if (rawBody !== undefined) {
    payload = rawBody;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    reqHeaders["Content-Type"] = "application/json";
  }

  const params = {
    headers: reqHeaders,
    tags: Object.assign({ name: name || `${method} ${path}` }, tags),
    responseCallback:
      expect === undefined
        ? DEFAULT_EXPECTED
        : http.expectedStatuses.apply(null, [].concat(expect)),
  };

  if (timeout) params.timeout = timeout;

  const res = http.request(method, url, payload, params);

  if (res.status === 429) rateLimited.add(1);
  if (res.status >= 500) serverErrors.add(1, { name: params.tags.name });
  if (res.status === 401 && token) unauthorized.add(1);

  return res;
}

export const get = (path, opts) => request("GET", path, opts);
export const post = (path, opts) => request("POST", path, opts);
export const put = (path, opts) => request("PUT", path, opts);
export const patch = (path, opts) => request("PATCH", path, opts);
export const del = (path, opts) => request("DELETE", path, opts);
