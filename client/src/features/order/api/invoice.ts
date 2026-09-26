import { AxiosError } from "axios";

import axiosInstance from "@/shared/lib/axiosInstance";

const DOWNLOAD_FALLBACK = "Could not download the invoice";

/** The server sets `attachment; filename="INV-000123.pdf"`. */
const filenameFromDisposition = (header?: string): string | null => {
  if (!header) return null;

  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1] ?? null;
};

/**
 * With `responseType: "blob"` the error body also arrives as a Blob, so the
 * usual `{ message }` JSON is unreadable until it is parsed.
 */
const messageFromBlob = async (blob: Blob): Promise<string> => {
  try {
    const parsed = JSON.parse(await blob.text()) as { message?: string };
    return parsed.message || DOWNLOAD_FALLBACK;
  } catch {
    return DOWNLOAD_FALLBACK;
  }
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoked on a delay: releasing the object URL synchronously can cancel the
  // download in some browsers before it has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Downloads the stored invoice PDF for an order. The route is auth-protected, so
 * this goes through the axios instance (which attaches the bearer token and
 * handles refresh) rather than a plain link or `window.open`.
 */
export const downloadInvoiceForOrder = async (orderId: string) => {
  let res;

  try {
    res = await axiosInstance.get<Blob>(`/invoice/${orderId}/download`, {
      responseType: "blob",
    });
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data instanceof Blob) {
      throw new Error(await messageFromBlob(error.response.data));
    }

    throw error;
  }

  const filename =
    filenameFromDisposition(res.headers["content-disposition"]) ??
    `invoice-${orderId}.pdf`;

  saveBlob(res.data, filename);

  return filename;
};
