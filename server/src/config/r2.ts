import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/config/env.config";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const r2Bucket = env.R2_BUCKET;
export const r2PublicUrl = env.R2_PUBLIC_URL.replace(/\/+$/, "");
