/**
 * Client mirror of the server's `sendResponse` envelope
 * (server/src/utils/response.ts). Every JSON endpoint responds with this
 * shape, so API functions type their payload through `TApiResponse<T>`.
 */
export type TApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: TPagination;
};

/** Mirrors the server's `Pagination` interface. */
export type TPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
