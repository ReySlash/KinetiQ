import { localDateStart } from './analytics-calendar';

describe('analytics calendar', () => {
  it('uses the earliest valid instant when local midnight does not exist', () => {
    // Failure mode: BC-10
    expect(localDateStart('2009-06-01', 'Africa/Casablanca')).toEqual(
      new Date('2009-06-01T00:00:00.000Z'),
    );
  });

  it('uses the first valid instant after an entirely skipped local date', () => {
    // Failure mode: BC-10
    expect(localDateStart('2011-12-30', 'Pacific/Apia')).toEqual(
      new Date('2011-12-30T10:00:00.000Z'),
    );
  });
});
