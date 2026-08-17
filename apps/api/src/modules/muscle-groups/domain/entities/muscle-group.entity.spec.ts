import { MuscleGroup } from './muscle-group.entity';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

describe('MuscleGroup', () => {
  const attributes = {
    name: 'upper body',
    description: 'Muscles of the upper body.',
    bodyRegion: 'UPPER_BODY' as const,
    sortOrder: 3,
  };

  it('creates a muscle group with normalized values and a generated id', () => {
    const group = MuscleGroup.create(attributes);

    expect(group.id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(group.name).toBe('Upper body');
    expect(group.slug).toBe('upper-body');
    expect(group.description).toBe('Muscles of the upper body.');
    expect(group.bodyRegion).toBe('UPPER_BODY');
    expect(group.sortOrder).toBe(3);
  });

  it('reconstitutes persisted values without changing them', () => {
    const persisted = {
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Upper body',
      slug: 'upper-body',
      description: null,
      bodyRegion: 'UPPER_BODY' as const,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      sortOrder: 0,
      createdAt: new Date('2026-07-21T00:00:00.000Z'),
      updatedAt: new Date('2026-07-21T00:00:00.000Z'),
    };

    expect(MuscleGroup.reconstitute(persisted).toValue()).toEqual(persisted);
  });

  it.each([
    ['name', { ...attributes, name: '' }],
    ['description', { ...attributes, description: '' }],
    ['bodyRegion', { ...attributes, bodyRegion: 'INVALID' as never }],
    ['sortOrder', { ...attributes, sortOrder: -1 }],
  ])('rejects invalid %s values during creation', (_, invalidAttributes) => {
    expect(() => MuscleGroup.create(invalidAttributes)).toThrow(
      MuscleGroupValidationError,
    );
  });

  it('rejects empty optional media values', () => {
    expect(() =>
      MuscleGroup.create({ ...attributes, thumbnailUrl: '   ' }),
    ).toThrow(MuscleGroupValidationError);
  });
});
