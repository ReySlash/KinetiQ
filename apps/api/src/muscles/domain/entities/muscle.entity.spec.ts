import { Muscle } from './muscle.entity';

describe('Muscle', () => {
  const attributes = {
    name: 'biceps brachii',
    description: 'primary elbow flexor of the upper arm.',
    bodyRegion: 'UPPER_BODY' as const,
    muscleGroupId: 'd0c0e5fa-9f8d-4a34-8d0e-9f45ab7d2e12',
    sortOrder: 3,
  };

  it('creates a muscle using the current creation normalization behavior', () => {
    const muscle = Muscle.create(attributes);

    expect(muscle.id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(muscle.name).toBe('Biceps brachii');
    expect(muscle.slug).toBe('biceps-brachii');
    expect(muscle.description).toBe('Primary elbow flexor of the upper arm.');
    expect(muscle.isActive).toBe(true);
    expect(muscle.sortOrder).toBe(3);
  });

  it('reconstitutes a persisted muscle without changing its values', () => {
    const persisted = {
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Biceps Brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY' as const,
      muscleGroupId: null,
      parentId: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date('2026-07-21T00:00:00.000Z'),
      updatedAt: new Date('2026-07-21T00:00:00.000Z'),
    };

    expect(Muscle.reconstitute(persisted).toValue()).toEqual(persisted);
  });
});
