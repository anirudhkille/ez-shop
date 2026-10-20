import crypto from "crypto";

/** Refresh tokens are stored hashed, so a leaked session row cannot be replayed. */
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
