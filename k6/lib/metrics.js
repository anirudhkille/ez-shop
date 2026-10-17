import { Counter, Trend } from "k6/metrics";

// Any 429 from the API. During load tests this should stay at zero: it means
// the global limiter (not the application) is what is being measured.
export const rateLimited = new Counter("rate_limited_responses");

// Any 5xx. The API should degrade with 4xx/429, never with a crash.
export const serverErrors = new Counter("server_error_responses");

// An authenticated request answered with 401, e.g. an expired access token
// during a long run. Surfaced separately so it is not mistaken for a bug.
export const unauthorized = new Counter("unauthorized_responses");

// Behaviour that is not necessarily a bug but deserves a human decision, e.g.
// an endpoint that is readable without authentication. Informational only.
export const securityFindings = new Counter("security_findings");

// Wall-clock time for a complete user journey (several requests).
export const journeyDuration = new Trend("journey_duration", true);
