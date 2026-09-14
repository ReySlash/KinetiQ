export const STANDARD_RATE_LIMIT_TTL_MS = 60_000;

export function getStandardRateLimit(nodeEnv = process.env.NODE_ENV) {
  return {
    limit: nodeEnv === 'production' ? 60 : 300,
    ttl: STANDARD_RATE_LIMIT_TTL_MS,
  };
}
