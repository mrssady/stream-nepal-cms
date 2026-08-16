import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const provider = this.configService.get<string>('MAIL_PROVIDER', 'console');

    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (provider === 'smtp' && smtpHost && smtpPort) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: Number(smtpPort) === 465,
        auth: smtpUser
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async send(input: SendMailInput): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          'no-reply@streamnepal.com',
        ),
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });

      return;
    }

    // Development fallback: log the email so flows are testable without SMTP.
    this.logger.log(
      `[Mail] To: ${input.to} | Subject: ${input.subject}\n${input.text}`,
    );
  }
}
