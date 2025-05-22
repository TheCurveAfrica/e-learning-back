import app from './app';
import settings from './core/config/application';
import connectDB from './core/config/database';
import { logger } from './core/utils/logger';

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(settings.app_port, () => {
    logger.info(`
        ###############################################
              ###  App listening on ${settings.app_port}  ###
        ###############################################
        `);
  });
};

startServer();
