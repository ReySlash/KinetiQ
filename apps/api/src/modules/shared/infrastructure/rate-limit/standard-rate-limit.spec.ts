import { getStandardRateLimit } from './standard-rate-limit';

describe('getStandardRateLimit', () => {
  it('uses 60 requests per minute in production', () => {
    expect(getStandardRateLimit('production')).toEqual({
      limit: 60,
      ttl: 60_000,
    });
  });

  it.each(['development', 'test', 'staging', undefined])(
    'uses 300 requests per minute for %s',
    (nodeEnv) => {
      expect(getStandardRateLimit(nodeEnv)).toEqual({
        limit: 300,
        ttl: 60_000,
      });
    },
  );
});
