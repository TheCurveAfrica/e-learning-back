import dotenv from 'dotenv';
dotenv.config();

const settings = {
  application_logs: process.env.SHOW_APPLICATION_LOGS,
  node_env: process.env.NODE_ENV,
  mongodb_url: process.env.MONGODB_URI,
  app_port: Number(process.env.APP_PORT),
  app_base_url: process.env.APP_BASE_URL
};

export default settings;
