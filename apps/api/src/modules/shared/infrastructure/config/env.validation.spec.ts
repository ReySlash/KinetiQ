import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('applies safe defaults for the initial scaffold', () => {
    expect(
      validateEnv({
        DATABASE_URL: 'postgresql://localhost:5432/kinetiq',
      }),
    ).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: undefined,
      DATABASE_URL: 'postgresql://localhost:5432/kinetiq',
      BETTER_AUTH_SECRET: undefined,
      BETTER_AUTH_URL: undefined,
    });
  });

  it('rejects invalid ports', () => {
    expect(() => validateEnv({ PORT: '70000' })).toThrow(
      'PORT must be an integer between 1 and 65535.',
    );
  });

  it('rejects invalid URLs when optional URL values are provided', () => {
    expect(() => validateEnv({ WEB_ORIGIN: 'kinetiq-web' })).toThrow(
      'WEB_ORIGIN must be a valid URL.',
    );
  });

  it('requires explicit secure auth configuration in production', () => {
    expect(() =>
      validateEnv({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://db' }),
    ).toThrow(
      'BETTER_AUTH_SECRET must be at least 32 characters in production.',
    );

    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
      }),
    ).toThrow('BETTER_AUTH_URL is required in production.');
  });

  it('rejects insecure production auth URLs', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
        BETTER_AUTH_URL: 'http://api.example.com',
        WEB_ORIGIN: 'https://app.example.com',
      }),
    ).toThrow('BETTER_AUTH_URL must use HTTPS in production.');

    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
        BETTER_AUTH_URL: 'https://api.example.com',
        WEB_ORIGIN: 'http://app.example.com',
      }),
    ).toThrow('WEB_ORIGIN must use HTTPS in production.');
  });

  it('accepts complete secure production auth configuration', () => {
    expect(
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
        BETTER_AUTH_URL: 'https://api.example.com',
        WEB_ORIGIN: 'https://app.example.com',
      }),
    ).toMatchObject({
      NODE_ENV: 'production',
      BETTER_AUTH_URL: 'https://api.example.com',
      WEB_ORIGIN: 'https://app.example.com',
    });
  });
});
