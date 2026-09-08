import mongoose from "mongoose";
import { env } from "@/config/env.config";
import { logger } from "@/config/logger";

export const databaseConnection = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("Database Connected");
  } catch (error) {
    logger.error(error, "Database Connection Error");
  }
};

mongoose.connection.on("error", (error) => {
  logger.error(error, "Mongoose Connection Error");
});
