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
});
