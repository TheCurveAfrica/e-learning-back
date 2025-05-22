import { logger } from '../utils/logger';
import settings from './application';
import { connect } from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string = settings.mongodb_url;
    await connect(mongoURI);
    logger.info('✅✅✅Database connection successful✅✅✅');
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
