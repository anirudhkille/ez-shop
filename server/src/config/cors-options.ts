import { CorsOptions } from "cors";
import { env } from "@/config/env.config";

const allowedOrigins = [
  ...env.CORS_ORIGINS,
  env.CLIENT_URL,
  env.ADMIN_URL,
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
