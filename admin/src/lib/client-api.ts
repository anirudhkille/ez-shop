import { deleteCookie, getCookie, setCookie } from "cookies-next";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export function getAuthToken(): string | null {
  return (getCookie("admin_token") as string | undefined) ?? null;
}

export function setAuthToken(token: string) {
  setCookie("admin_token", token, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function removeAuthToken() {
  deleteCookie("admin_token", { path: "/" });
}

export async function clientFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getAuthToken();
  const url = `${SERVER_URL}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
