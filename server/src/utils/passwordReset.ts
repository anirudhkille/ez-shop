import crypto from "node:crypto";

export const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

export const createResetToken = () => crypto.randomBytes(32).toString("hex");

export const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const resetSessionKey = (token: string) =>
  `reset:${hashResetToken(token)}`;
