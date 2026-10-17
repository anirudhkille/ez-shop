import type { APIRequestContext, APIResponse } from '@playwright/test';

export type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number>;
};

/**
 * Thin wrapper around Playwright's APIRequestContext that targets the ez-shop
 * backend. All responses are returned raw so each test can assert status +
 * body shape independently.
 */
export class ApiClient {
  constructor(
    private readonly api: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  setToken(token: string | null) {
    this.token = token;
  }

  private token: string | null = null;

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(
      path.startsWith('http') ? path : `${this.baseURL}${path}`,
    );
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    return this.api.fetch(this.buildUrl(path, options.query), {
      method,
      headers: this.headers(options.headers),
      ...(body !== undefined ? { data: JSON.stringify(body) } : {}),
    });
  }

  get(path: string, options?: RequestOptions) {
    return this.request('GET', path, undefined, options);
  }
  delete(path: string, options?: RequestOptions) {
    return this.request('DELETE', path, undefined, options);
  }
  post(path: string, body?: unknown, options?: RequestOptions) {
    return this.request('POST', path, body, options);
  }
  put(path: string, body?: unknown, options?: RequestOptions) {
    return this.request('PUT', path, body, options);
  }
  patch(path: string, body?: unknown, options?: RequestOptions) {
    return this.request('PATCH', path, body, options);
  }

  static async json(response: APIResponse): Promise<any> {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
}
