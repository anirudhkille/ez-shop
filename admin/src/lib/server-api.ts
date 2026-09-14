import { cookies } from "next/headers";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function serverFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("admin_token")?.value;
  const url = `${SERVER_URL}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
}
