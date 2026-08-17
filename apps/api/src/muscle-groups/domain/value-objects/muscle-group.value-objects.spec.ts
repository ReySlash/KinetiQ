import { MuscleGroupBodyRegion } from './muscle-group-body-region.vo';
import { MuscleGroupDescription } from './muscle-group-description.vo';
import { MuscleGroupImageAltText } from './muscle-group-image-alt-text.vo';
import { MuscleGroupName } from './muscle-group-name.vo';
import { MuscleGroupSlug } from './muscle-group-slug.vo';
import { MuscleGroupSortOrder } from './muscle-group-sort-order.vo';
import { MuscleGroupThumbnailStorageKey } from './muscle-group-thumbnail-storage-key.vo';
import { MuscleGroupThumbnailUrl } from './muscle-group-thumbnail-url.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

describe('Muscle Group value objects', () => {
  describe('MuscleGroupName', () => {
    it('trims and capitalizes the first character', () => {
      expect(MuscleGroupName.create('  upper body  ').value).toBe('Upper body');
    });

    it('accepts the one and fifty character boundaries', () => {
      expect(MuscleGroupName.create('a').value).toBe('A');
      expect(MuscleGroupName.create('a'.repeat(50)).value).toHaveLength(50);
    });

    it.each(['', 'a'.repeat(51)])('rejects invalid length: %s', (value) => {
      expect(() => MuscleGroupName.create(value)).toThrow(
        MuscleGroupValidationError,
      );
    });
  });

  describe('MuscleGroupSlug', () => {
    it('normalizes values to lowercase kebab-case', () => {
      expect(MuscleGroupSlug.create(' Upper / Body ').value).toBe('upper-body');
    });

    it('accepts a one-character slug and rejects empty or oversized values', () => {
      expect(MuscleGroupSlug.create('a').value).toBe('a');
      expect(() => MuscleGroupSlug.create('')).toThrow(
        MuscleGroupValidationError,
      );
      expect(() => MuscleGroupSlug.create('a'.repeat(51))).toThrow(
        MuscleGroupValidationError,
      );
    });
  });

  describe('MuscleGroupDescription', () => {
    it('trims the description', () => {
      expect(MuscleGroupDescription.create('  Upper body  ').value).toBe(
        'Upper body',
      );
    });

    it('accepts the one and two hundred character boundaries', () => {
      expect(MuscleGroupDescription.create('a').value).toBe('a');
      expect(MuscleGroupDescription.create('a'.repeat(200)).value).toHaveLength(
        200,
      );
    });

    it.each(['', 'a'.repeat(201)])('rejects invalid length: %s', (value) => {
      expect(() => MuscleGroupDescription.create(value)).toThrow(
        MuscleGroupValidationError,
      );
    });
  });

  describe('MuscleGroupBodyRegion', () => {
    it.each([
      'UPPER_BODY',
      'LOWER_BODY',
      'CORE',
      'FULL_BODY',
      'OTHER',
    ] as const)('accepts %s', (value) => {
      expect(MuscleGroupBodyRegion.create(value).value).toBe(value);
    });

    it('rejects unknown values', () => {
      expect(() => MuscleGroupBodyRegion.create('INVALID' as never)).toThrow(
        MuscleGroupValidationError,
      );
    });
  });

  describe.each([
    ['thumbnail URL', MuscleGroupThumbnailUrl],
    ['thumbnail storage key', MuscleGroupThumbnailStorageKey],
    ['image alt text', MuscleGroupImageAltText],
  ])('%s', (_, ValueObjectType) => {
    it('trims non-empty values', () => {
      expect(ValueObjectType.create('  value  ').value).toBe('value');
    });

    it('rejects whitespace-only values', () => {
      expect(() => ValueObjectType.create('   ')).toThrow(
        MuscleGroupValidationError,
      );
    });
  });

  describe('MuscleGroupSortOrder', () => {
    it('accepts zero and positive integers', () => {
      expect(MuscleGroupSortOrder.create(0).value).toBe(0);
      expect(MuscleGroupSortOrder.create(4).value).toBe(4);
    });

    it.each([-1, 1.5, Number.NaN])('rejects %s', (value) => {
      expect(() => MuscleGroupSortOrder.create(value)).toThrow(
        MuscleGroupValidationError,
      );
    });
  });
});
