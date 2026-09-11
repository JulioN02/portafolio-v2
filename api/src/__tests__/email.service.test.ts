import { createTransport } from 'nodemailer';
import { sendVerificationCodeEmail } from '../services/email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const mockedCreateTransport = createTransport as jest.MockedFunction<typeof createTransport>;

const SMTP_ENV_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'] as const;

describe('emailService', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sendMail.mockResolvedValue({ messageId: 'test-message-id' });
    mockedCreateTransport.mockReturnValue({ sendMail } as never);

    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'app-password';
    process.env.MAIL_FROM = 'J Soft Solutions <user@example.com>';
  });

  afterEach(() => {
    for (const key of SMTP_ENV_KEYS) {
      delete process.env[key];
    }
  });

  it('sends a plain-text email containing the code and the 10-minute expiry', async () => {
    await sendVerificationCodeEmail('dest@example.com', '123456');

    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: 'user@example.com', pass: 'app-password' },
      }),
    );
    expect(sendMail).toHaveBeenCalledTimes(1);

    const mail = sendMail.mock.calls[0][0] as {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
    };
    expect(mail.from).toBe('J Soft Solutions <user@example.com>');
    expect(mail.to).toBe('dest@example.com');
    expect(mail.text).toContain('123456');
    expect(mail.text).toContain('10 minutos');
    // YAGNI: plain text only, no HTML template.
    expect(mail.html).toBeUndefined();
  });

  it('uses implicit TLS only on port 465', async () => {
    process.env.SMTP_PORT = '587';
    await sendVerificationCodeEmail('dest@example.com', '123456');
    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it('throws a clear error when SMTP config is missing (never a silent no-op)', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PASS;

    await expect(sendVerificationCodeEmail('dest@example.com', '123456')).rejects.toThrow(
      /not configured.*SMTP_HOST.*SMTP_PASS/is,
    );
    expect(mockedCreateTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('throws when SMTP_PORT is not a valid port number', async () => {
    process.env.SMTP_PORT = 'not-a-port';
    await expect(sendVerificationCodeEmail('dest@example.com', '123456')).rejects.toThrow(
      /SMTP_PORT/,
    );
  });

  it('propagates SMTP send failures', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    await expect(sendVerificationCodeEmail('dest@example.com', '123456')).rejects.toThrow(
      'SMTP unavailable',
    );
  });
});
