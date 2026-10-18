import { flushSentry } from "./config/sentry";

import { env } from "./config/env.config";
import { logger } from "./config/logger";

import { databaseConnection } from "./config/database";

import app from "./app";

const startServer = async () => {
  try {
    await databaseConnection();
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
