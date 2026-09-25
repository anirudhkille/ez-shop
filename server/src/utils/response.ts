import type { Response } from "express";

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export const sendResponse = <T = Record<string, unknown>>(
  res: Response,
  status = 200,
  message = "Success",
  data: T | unknown[] = {} as T,
  pagination?: Pagination,
) => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
};
