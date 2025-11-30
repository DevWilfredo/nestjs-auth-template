import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { SendEmailDto } from "./dtos/send-email.dto";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name)
    private transporter = nodemailer.Transporter;
    private templateCache = new Map<string, handlebars.TemplateDelegate>();
    private templatesDir: string;

    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get<string>('SMTP_HOST'),
            port: this.config.get<number>('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.config.get<string>('SMTP_USER'),
                pass: this.config.get<string>('SMTP_PASS'),
            },
        });

        this.templatesDir = path.join(process.cwd(), 'src', 'email', 'templates')
    }

    private loadTemplate(name: string): handlebars.TemplateDelegate {
        if (this.templateCache.has(name)) return this.templateCache.get(name)!;

        const filePath = path.join(this.templatesDir, `${name}.hbs`);
        if (!fs.existsSync(filePath)) throw new Error(`Template not found: ${filePath}`);

        const source = fs.readFileSync(filePath, 'utf8');
        const template = handlebars.compile(source);
        this.templateCache.set(name, template);
        return template;
    }

    async sendMail(dto: SendEmailDto) {
        const from = this.config.get<string>('SMTP_FROM');
        const to = dto.to;
        const subject = dto.subject;

        let html = dto.html;
        let text = dto.text;

        if (dto.template) {
            const tpl = this.loadTemplate(dto.template);
            html = tpl(dto.templateVars || {})
        }

        const mailOptions = {
            from,
            to,
            subject,
            text,
            html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error('Error Sending Mail', error);
            throw error;
        }
    }

    async sendVerificationEmail(to: string, token: string, name?: string) {
        const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
        const privacyUrl = `${appUrl}/privacy`;
        const verificationUrl = `${appUrl}/api/v1/auth/verify-email?token=${token}`;

        await this.sendMail({
            to,
            subject: 'Account Confirmation',
            template: 'verification.template',
            templateVars: {
                name: name || 'User',
                verificationUrl,
                appName: this.config.get<string>('APP_NAME'),
                appUrl,
                privacyUrl,
            },
        });
    }

}