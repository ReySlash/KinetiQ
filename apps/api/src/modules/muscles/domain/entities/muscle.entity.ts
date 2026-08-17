import { Entity } from '../../../shared/domain/entity';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { BodyRegion as BodyRegionValue } from '../value-objects/muscle-body-region.vo';
import { MuscleDescription } from '../value-objects/muscle-description.vo';
import { MuscleGroupId } from '../value-objects/muscle-group-id.vo';
import { MuscleImageAltText } from '../value-objects/muscle-image-alt-text.vo';
import { MuscleName } from '../value-objects/muscle-name.vo';
import { MuscleParentId } from '../value-objects/muscle-parent-id.vo';
import { MuscleSortOrder } from '../value-objects/muscle-sort-order.vo';
import { MuscleSlug } from '../value-objects/muscle-slug.vo';
import { MuscleThumbnailStorageKey } from '../value-objects/muscle-thumbnail-storage-key.vo';
import { MuscleThumbnailUrl } from '../value-objects/muscle-thumbnail-url.vo';
import type {
  CreateMuscleAttributes,
  PrimitiveMuscle,
  UpdateMuscleAttributes,
} from './muscle.types';

export class Muscle extends Entity<UniqueId> {
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly bodyRegion: PrimitiveMuscle['bodyRegion'];
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
    const name = MuscleName.create(attributes.name);
    const description = MuscleDescription.create(attributes.description);
    const bodyRegion = BodyRegionValue.create(attributes.bodyRegion);
    const slug = MuscleSlug.create(attributes.slug ?? name.value);
    const muscleGroupId =
      attributes.muscleGroupId !== undefined
        ? MuscleGroupId.create(attributes.muscleGroupId)
        : null;
    const parentId =
      attributes.parentId !== undefined
        ? MuscleParentId.create(attributes.parentId)
        : null;
    const thumbnailUrl =
      attributes.thumbnailUrl !== undefined
        ? MuscleThumbnailUrl.create(attributes.thumbnailUrl)
        : null;
    const thumbnailStorageKey =
      attributes.thumbnailStorageKey !== undefined
        ? MuscleThumbnailStorageKey.create(attributes.thumbnailStorageKey)
        : null;
    const imageAltText =
      attributes.imageAltText !== undefined
        ? MuscleImageAltText.create(attributes.imageAltText)
        : null;
    const sortOrder = MuscleSortOrder.create(attributes.sortOrder ?? 0);
    const now = new Date();

    return new Muscle({
      id: UniqueId.create().value,
      name: name.value,
      slug: slug.value,
      description: description.value,
      bodyRegion: bodyRegion.value,
      muscleGroupId: muscleGroupId?.value ?? null,
      parentId: parentId?.value ?? null,
      thumbnailUrl: thumbnailUrl?.value ?? null,
      thumbnailStorageKey: thumbnailStorageKey?.value ?? null,
      imageAltText: imageAltText?.value ?? null,
      isActive: attributes.isActive ?? true,
      sortOrder: sortOrder.value,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(attributes: PrimitiveMuscle): Muscle {
    return new Muscle(attributes);
  }

  update(attributes: UpdateMuscleAttributes): Muscle {
    const name =
      attributes.name === undefined
        ? this.name
        : MuscleName.create(attributes.name).value;
    const description =
      attributes.description === undefined
        ? this.description
        : MuscleDescription.create(attributes.description).value;
    const bodyRegion =
      attributes.bodyRegion === undefined
        ? this.bodyRegion
        : BodyRegionValue.create(attributes.bodyRegion).value;
    const muscleGroupId =
      attributes.muscleGroupId === undefined
        ? this.muscleGroupId
        : attributes.muscleGroupId === null
          ? null
          : MuscleGroupId.create(attributes.muscleGroupId).value;
    const parentId =
      attributes.parentId === undefined
        ? this.parentId
        : attributes.parentId === null
          ? null
          : MuscleParentId.create(attributes.parentId).value;
    const thumbnailUrl =
      attributes.thumbnailUrl === undefined
        ? this.thumbnailUrl
        : attributes.thumbnailUrl === null
          ? null
          : MuscleThumbnailUrl.create(attributes.thumbnailUrl).value;
    const thumbnailStorageKey =
      attributes.thumbnailStorageKey === undefined
        ? this.thumbnailStorageKey
        : attributes.thumbnailStorageKey === null
          ? null
          : MuscleThumbnailStorageKey.create(attributes.thumbnailStorageKey)
              .value;
    const imageAltText =
      attributes.imageAltText === undefined
        ? this.imageAltText
        : attributes.imageAltText === null
          ? null
          : MuscleImageAltText.create(attributes.imageAltText).value;
    const sortOrder =
      attributes.sortOrder === undefined
        ? this.sortOrder
        : MuscleSortOrder.create(attributes.sortOrder).value;

    return new Muscle({
      id: this.id.value,
      name,
      slug: this.slug,
      description,
      bodyRegion,
      muscleGroupId,
      parentId,
      thumbnailUrl,
      thumbnailStorageKey,
      imageAltText,
      isActive: this.isActive,
      sortOrder,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
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
