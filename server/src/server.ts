import { flushSentry } from "./config/sentry";

import { env } from "./config/env.config";
import { logger } from "./config/logger";

import { databaseConnection } from "./config/database";
import Product from "./modules/product/product.model";
import { warmRedisHealth } from "./utils/redis-health";

import app from "./app";

const backfillProductNameLower = async () => {
  const result = await Product.updateMany({ nameLower: { $exists: false } }, [
    { $set: { nameLower: { $toLower: "$name" } } },
  ]);

  if (result.modifiedCount > 0) {
    logger.info(
      { count: result.modifiedCount },
      "Backfilled normalized product names for prefix search",
    );
  }
};

const startServer = async () => {
  try {
    await databaseConnection();
    await backfillProductNameLower();
    void warmRedisHealth();
    const port = env.PORT;
    app.listen(port, () => {
      logger.info(`Server Listening @ ${port}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start server");

    await flushSentry(2000);

    process.exit(1);
  }
};

startServer();
