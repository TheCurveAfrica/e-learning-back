import dotenv from 'dotenv';
dotenv.config();

const settings = {
  application_logs: process.env.SHOW_APPLICATION_LOGS,
  node_env: process.env.NODE_ENV,
  mongodb_url: process.env.MONGODB_URI,
  app_port: Number(process.env.APP_PORT),
  app_base_url: process.env.APP_BASE_URL,
  email: {
    verification_url: process.env.EMAIL_VERIFICATION_URL || '/api/v1/auth/email/verification-code'
  },
  reset_password: {
    reset_url: process.env.RESET_PASSWORD_URL,
    reset_link_validity_duration: process.env.RESET_LINK_VALIDITY_DURATION || '3600'
  },
  customer_email_verification: {
    link_validity_duration: Number(process.env.CUSTOMER_EMAIL_VERIFICATION_LINK_PERIOD_IN_SECONDS) || 86400,
    resend_limit: Number(process.env.CUSTOMER_EMAIL_VERIFICATION_RESEND_LIMIT) || 3,
    resend_limit_lockout_duration: Number(process.env.CUSTOMER_EMAIL_VERIFICATION_RESEND_LOCKOUT_PERIOD_IN_SECONDS) || 3600
  },
  jwt: {
    access_token_secret_key: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    access_token_expires_in: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
    refresh_token_secret_key: process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    refresh_token_expires_in: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN)
  },
  nodemailer: {
    host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE || 'gmail',
    port: Number(process.env.EMAIL_PORT || 465),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    key: process.env.CLOUDINARY_KEY,
    secret: process.env.CLOUDINARY_SECRET
  }
};

export default settings;
