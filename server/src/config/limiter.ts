import rateLimit from "express-rate-limit";

const e2eBypassEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.E2E_BYPASS_RATE_LIMIT === "true";

const rateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true";

const configuredApiMax = Number(process.env.RATE_LIMIT_MAX);
const apiMax =
  Number.isFinite(configuredApiMax) && configuredApiMax > 0
    ? configuredApiMax
    : 1000;

const configuredAuthMax = Number(process.env.AUTH_RATE_LIMIT_MAX);
const authMax =
  Number.isFinite(configuredAuthMax) && configuredAuthMax > 0
    ? configuredAuthMax
    : 10;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => rateLimitDisabled,
  message: "Too many requests from this IP, please try again later.",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    process.env.NODE_ENV === "test" ||
    rateLimitDisabled ||
    (e2eBypassEnabled && req.headers["x-e2e-test"] === "ezshop"),
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});

const configuredMapboxMax = Number(process.env.MAPBOX_RATE_LIMIT_MAX);
const mapboxMax =
  Number.isFinite(configuredMapboxMax) && configuredMapboxMax > 0
    ? configuredMapboxMax
    : 60;

export const mapboxLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: mapboxMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    process.env.NODE_ENV === "test" ||
    rateLimitDisabled ||
    (e2eBypassEnabled && req.headers["x-e2e-test"] === "ezshop"),
  message: {
    success: false,
    message: "Too many address lookups, please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});
