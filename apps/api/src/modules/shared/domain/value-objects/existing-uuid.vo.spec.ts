import { ExistingUuid } from './existing-uuid.vo';

describe('ExistingUuid', () => {
  it('creates from a valid existing UUID', () => {
    const value = 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1';

    expect(ExistingUuid.create(value).value).toBe(value);
  });

  it('rejects invalid UUIDs', () => {
    expect(() => ExistingUuid.create('not-a-uuid')).toThrow(
      'Unique ID must be a valid UUID.',
    );
  });
});
