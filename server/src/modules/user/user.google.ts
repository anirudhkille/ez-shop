import { env } from "@/config/env.config";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const REQUEST_TIMEOUT_MS = 10_000;

export interface GoogleTokens {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

const MOBILE_REDIRECT_PATTERN = /^ezshop:\/\/[a-zA-Z0-9/_-]*$/;

/**
 * The native app completes sign-in through its own scheme rather than the web
 * client. Only the final hop differs, so the app's redirect travels in Google's
 * `state` param and the `redirect_uri` sent to Google stays the registered one.
 *
 * Anything not matching the app scheme is rejected, so a crafted `state` cannot
 * turn the callback into an open redirect.
 */
export const isAllowedPostAuthRedirect = (value: unknown): value is string =>
  typeof value === "string" && MOBILE_REDIRECT_PATTERN.test(value);

export const getGoogleAuthURL = (state?: string) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.set("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const getGoogleTokens = async (code: string): Promise<GoogleTokens> => {
  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    grant_type: "authorization_code",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return (await response.json()) as GoogleTokens;
};

export const getGoogleUser = async (
  accessToken: string,
): Promise<GoogleProfile> => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user");
  }

  const profile = (await response.json()) as GoogleProfile;

  if (!profile.email || !profile.verified_email) {
    throw new Error("Google email is missing or not verified");
  }

  return profile;
};
