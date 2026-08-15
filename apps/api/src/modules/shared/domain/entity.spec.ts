import { Entity } from './entity';
import { UniqueId } from './value-objects/unique-id.vo';

class TestEntity extends Entity {
  constructor(id?: UniqueId) {
    super(id ?? UniqueId.create());
  }
}

describe('UniqueId', () => {
  it('creates valid UUID identifiers', () => {
    const id = UniqueId.create();

    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('reconstitutes valid UUID identifiers', () => {
    const value = '123e4567-e89b-12d3-a456-426614174000';
    const id = UniqueId.create(value);

    expect(id.value).toBe(value);
  });

  it('rejects invalid identifiers', () => {
    expect(() => UniqueId.create('not-a-uuid')).toThrow(
      'Unique ID must be a valid UUID.',
    );
  });

  it('compares identifiers by value', () => {
    const value = '123e4567-e89b-12d3-a456-426614174000';

    expect(UniqueId.create(value).equals(UniqueId.create(value))).toBe(true);
    expect(UniqueId.create().equals(UniqueId.create())).toBe(false);
  });
});

describe('Entity', () => {
  it('compares entities by identity', () => {
    const id = UniqueId.create();
    const first = new TestEntity(id);
    const second = new TestEntity(UniqueId.create(id.value));
    const other = new TestEntity();

    expect(first.equals(first)).toBe(true);
    expect(first.equals(second)).toBe(true);
    expect(first.equals(other)).toBe(false);
    expect(first.id).toBe(id);
  });
});
