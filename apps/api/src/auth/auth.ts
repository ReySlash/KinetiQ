import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../prisma/prisma.service';

type AuthConfig = {
  apiUrl: string;
  webOrigin?: string;
  secret: string;
  resendApiKey?: string;
  resendFromEmail?: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  );
}

async function sendEmail(
  apiKey: string,
  from: string,
  recipient: string,
  subject: string,
  html: string,
  text: string,
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Resend rejected the verification email (${response.status}).`,
    );
  }
}

export function createAuth(
  prisma: PrismaService,
  configService: ConfigService,
) {
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const secret = configService.get<string>('BETTER_AUTH_SECRET');

  if (!secret && nodeEnv !== 'test') {
    throw new Error(
      'BETTER_AUTH_SECRET is required outside test environments.',
    );
  }

  const config: AuthConfig = {
    apiUrl:
      configService.get<string>('BETTER_AUTH_URL') ??
      `http://localhost:${configService.get<number>('PORT') ?? 3000}`,
    webOrigin: configService.get<string>('WEB_ORIGIN'),
    secret: secret ?? 'test-only-better-auth-secret-32-characters',
    resendApiKey: configService.get<string>('RESEND_API_KEY'),
    resendFromEmail: configService.get<string>('RESEND_FROM_EMAIL'),
  };

  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    baseURL: config.apiUrl,
    basePath: '/api/auth',
    secret: config.secret,
    trustedOrigins: [config.apiUrl, config.webOrigin].filter(
      (origin): origin is string => Boolean(origin),
    ),
    advanced: {
      database: {
        generateId: () => randomUUID(),
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          input: false,
          defaultValue: 'USER',
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: true,
      sendResetPassword: ({ user, url }) => {
        if (!config.resendApiKey || !config.resendFromEmail) {
          throw new Error(
            'RESEND_API_KEY and RESEND_FROM_EMAIL are required to send password reset emails.',
          );
        }

        return sendEmail(
          config.resendApiKey,
          config.resendFromEmail,
          user.email,
          'Reset your KinetiQ password',
          `<p>We received a request to reset your KinetiQ password.</p><p><a href="${escapeHtml(url)}">Reset your password</a></p><p>This link expires in one hour.</p>`,
          `Reset your KinetiQ password: ${url}\n\nThis link expires in one hour.`,
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: ({ user, url }) => {
        if (!config.resendApiKey || !config.resendFromEmail) {
          throw new Error(
            'RESEND_API_KEY and RESEND_FROM_EMAIL are required to send verification emails.',
          );
        }

        return sendEmail(
          config.resendApiKey,
          config.resendFromEmail,
          user.email,
          'Verify your KinetiQ email address',
          `<p>Welcome to KinetiQ.</p><p><a href="${escapeHtml(url)}">Verify your email address</a></p><p>This link expires in one hour.</p>`,
          `Welcome to KinetiQ. Verify your email address: ${url}\n\nThis link expires in one hour.`,
        );
      },
    },
  });
}
