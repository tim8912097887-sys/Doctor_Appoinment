import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { gracefulShutdown } from "@utils/shutdown.js";
import { env } from "@configs/env.js";
import { logger } from "@utils/logger.js";

async function bootStrape() {
    try {
      // Use in ES Modules
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      
      // Define the logs directory path
      const logDirectory = path.join(__dirname, "logs");
      
      // Ensure the directory exists synchronously before creating the stream
      if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
      }
      
      // For log write
      const appendStream = fs.createWriteStream(path.join(logDirectory, "access.log"),{ flags: 'a' });
      const { initializeApp } = await import("@/app.js");
      const app = initializeApp(appendStream);
      const server = app.listen(env.PORT, () => {
        logger.info(`Server is running on port ${env.PORT}`);
      });
      const shutdownHandler = gracefulShutdown({ server });
    // Handle termination signals and unexpected errors
    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      shutdownHandler('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdownHandler('unhandledRejection');
    });
    } catch (error: any) {
      logger.error(`Server initialization failed: ${error.message}`);
      process.exit(1);
    }
  
};

bootStrape();
