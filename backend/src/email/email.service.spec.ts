import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('handlebars');

describe('EmailService', () => {
  let service: EmailService;
  let configMock: any;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    // Mock nodemailer's sendMail
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mock-id-123' });

    // Mock nodemailer's createTransport
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    // Mock ConfigService
    configMock = {
      get: jest.fn((key: string) => {
        const mockConfig = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: 587,
          SMTP_USER: 'test_user',
          SMTP_PASS: 'test_pass',
          SMTP_FROM: 'noreply@test.com',
          APP_URL: 'http://localhost:3000',
          APP_NAME: 'MyApp',
        };
        return mockConfig[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // TESTS
  // -----------------------------

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a basic email', async () => {
    const dto = {
      to: 'test@example.com',
      subject: 'Hello',
      text: 'This is a test email',
      html: '<p>Hello!</p>',
    };

    const result = await service.sendMail(dto);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@test.com',
      to: 'test@example.com',
      subject: 'Hello',
      text: 'This is a test email',
      html: '<p>Hello!</p>',
    });

    expect(result).toEqual({ messageId: 'mock-id-123' });
  });

  it('should use a handlebars template when provided', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('<p>Hello {{name}}</p>');

    const compileMock = jest.fn().mockReturnValue((vars: any) => `<p>Hello ${vars.name}</p>`);
    (handlebars.compile as jest.Mock).mockImplementation(compileMock);

    const dto = {
      to: 'template@test.com',
      subject: 'Welcome!',
      template: 'welcome',
      templateVars: { name: 'Alice' },
    };

    await service.sendMail(dto);

    // Verify that handlebars compiled the template
    expect(handlebars.compile).toHaveBeenCalledWith('<p>Hello {{name}}</p>');

    // Verify that sendMail received the compiled HTML
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: '<p>Hello Alice</p>',
      }),
    );
  });

  it('should send verification email with correct variables', async () => {
    const spySendMail = jest.spyOn(service, 'sendMail').mockResolvedValue({ messageId: 'mock' });

    await service.sendVerificationEmail('user@mail.com', 'token123', 'John');

    expect(spySendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@mail.com',
        subject: 'Account Confirmation',
        template: 'verification.template',
        templateVars: expect.objectContaining({
          name: 'John',
          verificationUrl: 'http://localhost:3000/api/v1/auth/verify-email?token=token123',
          appName: 'MyApp',
          appUrl: 'http://localhost:3000',
          privacyUrl: 'http://localhost:3000/privacy',
        }),
      }),
    );
  });

  it('should throw if transporter.sendMail fails', async () => {
    const error = new Error('SMTP failure');
    sendMailMock.mockRejectedValueOnce(error);

    await expect(
      service.sendMail({
        to: 'fail@test.com',
        subject: 'Fail test',
      }),
    ).rejects.toThrow('SMTP failure');
  });
});
