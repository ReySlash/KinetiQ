type NodeEnv = 'development' | 'test' | 'production';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnv;
  PORT: number;
  WEB_ORIGIN?: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

const validNodeEnvs = new Set<NodeEnv>(['development', 'test', 'production']);

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === undefined || value.trim() === '') {
    return 'development';
  }

  if (!validNodeEnvs.has(value as NodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, test, production.');
  }

  return value as NodeEnv;
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function parseOptionalUrl(
  name: string,
  value: string | undefined,
): string | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
}

function parseProductionAuthConfig(
  nodeEnv: NodeEnv,
  betterAuthSecret: string | undefined,
  betterAuthUrl: string | undefined,
  webOrigin: string | undefined,
): void {
  if (nodeEnv !== 'production') {
    return;
  }

  if (!betterAuthSecret || betterAuthSecret.trim().length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET must be at least 32 characters in production.',
    );
  }

  if (!betterAuthUrl) {
    throw new Error('BETTER_AUTH_URL is required in production.');
  }

  if (!webOrigin) {
    throw new Error('WEB_ORIGIN is required in production.');
  }

  for (const [name, value] of [
    ['BETTER_AUTH_URL', betterAuthUrl],
    ['WEB_ORIGIN', webOrigin],
  ] as const) {
    if (new URL(value).protocol !== 'https:') {
      throw new Error(`${name} must use HTTPS in production.`);
    }
  }
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const nodeEnv =
    typeof config.NODE_ENV === 'string' ? config.NODE_ENV : undefined;
  const port = typeof config.PORT === 'string' ? config.PORT : undefined;
  const webOrigin =
    typeof config.WEB_ORIGIN === 'string' ? config.WEB_ORIGIN : undefined;
  const databaseUrl =
    typeof config.DATABASE_URL === 'string' ? config.DATABASE_URL : undefined;
  const betterAuthSecret =
    typeof config.BETTER_AUTH_SECRET === 'string'
      ? config.BETTER_AUTH_SECRET
      : undefined;
  const betterAuthUrl =
    typeof config.BETTER_AUTH_URL === 'string'
      ? config.BETTER_AUTH_URL
      : undefined;
  const resendApiKey =
    typeof config.RESEND_API_KEY === 'string'
      ? config.RESEND_API_KEY
      : undefined;
  const resendFromEmail =
    typeof config.RESEND_FROM_EMAIL === 'string'
      ? config.RESEND_FROM_EMAIL
      : undefined;

  const parsedNodeEnv = parseNodeEnv(nodeEnv);
  const parsedWebOrigin = parseOptionalUrl('WEB_ORIGIN', webOrigin);
  const parsedBetterAuthUrl = parseOptionalUrl(
    'BETTER_AUTH_URL',
    betterAuthUrl,
  );

  parseProductionAuthConfig(
    parsedNodeEnv,
    betterAuthSecret,
    parsedBetterAuthUrl,
    parsedWebOrigin,
  );

  return {
    NODE_ENV: parsedNodeEnv,
    PORT: parsePort(port),
    WEB_ORIGIN: parsedWebOrigin,
    DATABASE_URL:
      databaseUrl ??
      (() => {
        throw new Error('DATABASE_URL is required.');
      })(),
    BETTER_AUTH_SECRET: betterAuthSecret,
    BETTER_AUTH_URL: parsedBetterAuthUrl,
    RESEND_API_KEY: resendApiKey,
    RESEND_FROM_EMAIL: resendFromEmail,
  };
}
