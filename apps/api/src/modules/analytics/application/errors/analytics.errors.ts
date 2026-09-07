export class AnalyticsValidationError extends Error {
  readonly code = 'ANALYTICS_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'AnalyticsValidationError';
  }
}

export class AnalyticsQueryError extends Error {
  readonly code = 'ANALYTICS_QUERY_FAILED';

  constructor(message = 'Analytics data could not be loaded.') {
    super(message);
    this.name = 'AnalyticsQueryError';
  }
}
