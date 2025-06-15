import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import settings from '../config/application';

const template = fs.readFileSync(path.join(__dirname, '..', 'templates/email.html'), 'utf8');

class EmailService {
  constructor() {}

  static async sendForgotPasswordMail(to: string, code: string): Promise<any> {
    const subject = 'Forgot Password';
    const message = `Your verfication code is: <b>${code}</b>`;

    return this.sendMail(to, subject, message);
  }

  private static replaceTemplateConstant(_template: string, key: string, data: string): string {
    const regex = new RegExp(key, 'g');
    return _template.replace(regex, data);
  }

  private static async sendMail(to: string, subject: string, message: string): Promise<any> {
    const appName = 'Zico Bank';
    const supportEmail = settings.nodemailer.user;
    const name = to.split('@')[0];

    let html = this.replaceTemplateConstant(template, 'APP_NAME', appName);
    html = this.replaceTemplateConstant(html, 'SUPPORT_EMAIL', supportEmail);
    html = this.replaceTemplateConstant(html, 'CLIENT_NAME', name);
    html = this.replaceTemplateConstant(html, 'MESSAGE', message);
    html = this.replaceTemplateConstant(html, 'YEAR', new Date().getFullYear().toString());
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: settings.nodemailer.host || 'smtp.gmail.com',
      port: settings.nodemailer.port || 465,
      auth: {
        user: settings.nodemailer.user,
        pass: settings.nodemailer.pass
      }
    });

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'E-commerce Service',
        address: process.env.EMAIL_USER || 'hizikex@gmail.com'
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

export const emailService = new EmailService();
