export class InvalidUuidError extends Error {
  constructor() {
    super('Unique ID must be a valid UUID.');
    this.name = 'InvalidUuidError';
  }
}
