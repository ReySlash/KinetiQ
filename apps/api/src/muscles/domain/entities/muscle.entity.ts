import { Entity } from '../../../modules/shared/domain/entity';
import { UniqueId } from '../../../modules/shared/domain/value-objects/unique-id.vo';
import { MuscleSlug } from '../value-objects/muscle-slug.vo';
import type {
  CreateMuscleAttributes,
  MuscleBodyRegion,
  PrimitiveMuscle,
} from './muscle.types';

function capitalizeFirstCharacter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export class Muscle extends Entity<UniqueId> {
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly bodyRegion: MuscleBodyRegion;
  public readonly muscleGroupId: string | null;
  public readonly parentId: string | null;
  public readonly thumbnailUrl: string | null;
  public readonly thumbnailStorageKey: string | null;
  public readonly imageAltText: string | null;
  public readonly isActive: boolean;
  public readonly sortOrder: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(attributes: PrimitiveMuscle) {
    super(UniqueId.create(attributes.id));
    this.name = attributes.name;
    this.slug = attributes.slug;
    this.description = attributes.description;
    this.bodyRegion = attributes.bodyRegion;
    this.muscleGroupId = attributes.muscleGroupId;
    this.parentId = attributes.parentId;
    this.thumbnailUrl = attributes.thumbnailUrl;
    this.thumbnailStorageKey = attributes.thumbnailStorageKey;
    this.imageAltText = attributes.imageAltText;
    this.isActive = attributes.isActive;
    this.sortOrder = attributes.sortOrder;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }

  static create(attributes: CreateMuscleAttributes): Muscle {
    const name = capitalizeFirstCharacter(attributes.name);
    const description = capitalizeFirstCharacter(attributes.description);
    const slug = MuscleSlug.create(attributes.slug ?? name);
    const now = new Date();

    return new Muscle({
      id: UniqueId.create().value,
      name,
      slug: slug.value,
      description,
      bodyRegion: attributes.bodyRegion,
      muscleGroupId: attributes.muscleGroupId ?? null,
      parentId: attributes.parentId ?? null,
      thumbnailUrl: attributes.thumbnailUrl ?? null,
      thumbnailStorageKey: attributes.thumbnailStorageKey ?? null,
      imageAltText: attributes.imageAltText ?? null,
      isActive: attributes.isActive ?? true,
      sortOrder: attributes.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(attributes: PrimitiveMuscle): Muscle {
    return new Muscle(attributes);
  }

  toValue(): PrimitiveMuscle {
    return {
      id: this.id.value,
      name: this.name,
      slug: this.slug,
      description: this.description,
      bodyRegion: this.bodyRegion,
      muscleGroupId: this.muscleGroupId,
      parentId: this.parentId,
      thumbnailUrl: this.thumbnailUrl,
      thumbnailStorageKey: this.thumbnailStorageKey,
      imageAltText: this.imageAltText,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
