import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { r2Bucket, r2Client, r2PublicUrl } from "@/config/r2";
import { AppError } from "@/utils/app-error";

interface ImageType {
  mime: string;
  extension: string;
}

const JPEG: ImageType = { mime: "image/jpeg", extension: "jpg" };
const PNG: ImageType = { mime: "image/png", extension: "png" };
const WEBP: ImageType = { mime: "image/webp", extension: "webp" };
const AVIF: ImageType = { mime: "image/avif", extension: "avif" };
const GIF: ImageType = { mime: "image/gif", extension: "gif" };

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const ascii = (buffer: Buffer, start: number, end: number) =>
  buffer.subarray(start, end).toString("ascii");

/**
 * Trust the bytes, not the client-provided MIME type. This keeps SVG (and any
 * other executable/active content) out of the public bucket.
 */
export const detectImageType = (buffer: Buffer): ImageType | null => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return JPEG;
  }

  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return PNG;
  }

  if (
    buffer.length >= 12 &&
    ascii(buffer, 0, 4) === "RIFF" &&
    ascii(buffer, 8, 12) === "WEBP"
  ) {
    return WEBP;
  }

  if (buffer.length >= 12 && ascii(buffer, 4, 8) === "ftyp") {
    const brands = ascii(buffer, 8, Math.min(buffer.length, 64));
    if (brands.includes("avif") || brands.includes("avis")) {
      return AVIF;
    }
  }

  if (buffer.length >= 6 && ascii(buffer, 0, 3) === "GIF") {
    return GIF;
  }

  return null;
};

export const normalizeFolder = (folder: string) => {
  const normalized = folder
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^ez-shop\//i, "")
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");

  return normalized || "uploads";
};

export const uploadToR2 = async (folder: string, fileBuffer: Buffer) => {
  if (!fileBuffer.length) {
    throw new AppError("Image file is empty", 400);
  }

  const imageType = detectImageType(fileBuffer);

  if (!imageType) {
    throw new AppError(
      "Unsupported image format. Use JPEG, PNG, WebP, AVIF, or GIF.",
      400,
    );
  }

  const key = `${normalizeFolder(folder)}/${randomUUID()}.${imageType.extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: imageType.mime,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: `${r2PublicUrl}/${key}`,
  };
};

const keyFromUrlOrKey = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return null;

  if (trimmed.startsWith(`${r2PublicUrl}/`)) {
    const path = trimmed.slice(r2PublicUrl.length + 1).split(/[?#]/)[0];

    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  }

  // Never try to delete assets that are not stored in our bucket.
  if (/^https?:\/\//i.test(trimmed)) return null;

  return trimmed.replace(/^\/+/, "");
};

export const deleteFromR2 = async (urlOrKey: string) => {
  const key = keyFromUrlOrKey(urlOrKey);

  if (!key) return;

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Bucket,
      Key: key,
    }),
  );
};
