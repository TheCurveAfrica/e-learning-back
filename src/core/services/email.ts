import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import settings from '../config/application';
import { logger } from '../utils/logger';

const template = fs.readFileSync(path.join(__dirname, '..', 'templates/email.html'), 'utf8');

class EmailService {
  static async sendAdminPasswordEmail(data: { to: string; name: string; password: string }): Promise<void> {
    const subject = 'Your Admin Account Password';
    const message = `Hello ${data.name}, your admin account has been created. Your password is: <b>${data.password}</b>`;
    await this.sendMail(data.to, subject, message);
  }
  constructor() {}

  static async sendForgotPasswordMail(to: string, code: string): Promise<any> {
    const subject = 'Forgot Password';
    const message = `Your verfication code is: <b>${code}</b>`;

    return this.sendMail(to, subject, message);
  }

  static async welcomeEmail(data: { to: string; name: string }): Promise<void> {
    const subject = 'Welcome to the curve';
    const message = `Hello ${data.name}, welcome to the curve! You can proceed to fill out your profile`;
    return this.sendMail(data.to, subject, message);
  }

  static async sendPasswordResetMail(data: { to: string; code: string }): Promise<any> {
    const subject = 'Password Reset';
    const message = `Your password reset code is: <b>${data.code}</b>`;
    return this.sendMail(data.to, subject, message);
  }

  static async sendEmailVerificationCode(data: { to: string; code: string }): Promise<void> {
    const subject = 'Verify your email address';
    const message = `Enter the 6-digit code sent to your email: ${data.code}`;
    return this.sendMail(data.to, subject, message);
  }

  private static replaceTemplateConstant(_template: string, key: string, data: string): string {
    const regex = new RegExp(key, 'g');
    return _template.replace(regex, data);
  }

  private static async sendMail(to: string, subject: string, message: string): Promise<any> {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: settings.nodemailer.host || 'smtp.gmail.com',
      port: settings.nodemailer.port || 465,
      auth: {
        user: settings.nodemailer.user,
        pass: settings.nodemailer.pass
      }
    });

    if (!transport) {
      logger.warn(`Email to ${to} not sent: Email service not configured`);
      return false;
    }
    const appName = 'afiaOma';
    const supportEmail = settings.nodemailer.user;
    const name = to.split('@')[0];

    let html = this.replaceTemplateConstant(template, 'APP_NAME', appName);
    html = this.replaceTemplateConstant(html, 'SUPPORT_EMAIL', supportEmail);
    html = this.replaceTemplateConstant(html, 'CLIENT_NAME', name);
    html = this.replaceTemplateConstant(html, 'MESSAGE', message);
    html = this.replaceTemplateConstant(html, 'YEAR', new Date().getFullYear().toString());

    transport.verify((error) => {
      if (error) {
        logger.error('Email service error:', error);
      } else {
        logger.info('Email service is ready to send messages');
      }
    });

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'afiaOma',
        address: process.env.EMAIL_USER || 'afiaoma@gmail.com'
      },
      to,
      subject,
      text: message,
      html: html
    };

    const infoMail = await transport.sendMail(mailOptions);
    return infoMail;
  }
}

export default EmailService;
