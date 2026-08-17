import { Entity } from '../../../shared/domain/entity';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { MuscleGroupBodyRegion } from '../value-objects/muscle-group-body-region.vo';
import { MuscleGroupDescription } from '../value-objects/muscle-group-description.vo';
import { MuscleGroupImageAltText } from '../value-objects/muscle-group-image-alt-text.vo';
import { MuscleGroupName } from '../value-objects/muscle-group-name.vo';
import { MuscleGroupSlug } from '../value-objects/muscle-group-slug.vo';
import { MuscleGroupSortOrder } from '../value-objects/muscle-group-sort-order.vo';
import { MuscleGroupThumbnailStorageKey } from '../value-objects/muscle-group-thumbnail-storage-key.vo';
import { MuscleGroupThumbnailUrl } from '../value-objects/muscle-group-thumbnail-url.vo';
import type {
  CreateMuscleGroupAttributes,
  PrimitiveMuscleGroup,
} from './muscle-group.types';

export class MuscleGroup extends Entity<UniqueId> {
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string | null;
  public readonly bodyRegion: PrimitiveMuscleGroup['bodyRegion'];
  public readonly thumbnailUrl: string | null;
  public readonly thumbnailStorageKey: string | null;
  public readonly imageAltText: string | null;
  public readonly sortOrder: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(attributes: PrimitiveMuscleGroup) {
    super(UniqueId.create(attributes.id));
    this.name = attributes.name;
    this.slug = attributes.slug;
    this.description = attributes.description;
    this.bodyRegion = attributes.bodyRegion;
    this.thumbnailUrl = attributes.thumbnailUrl;
    this.thumbnailStorageKey = attributes.thumbnailStorageKey;
    this.imageAltText = attributes.imageAltText;
    this.sortOrder = attributes.sortOrder;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }

  static create(attributes: CreateMuscleGroupAttributes): MuscleGroup {
    const name = MuscleGroupName.create(attributes.name);
    const slug = MuscleGroupSlug.create(attributes.slug ?? name.value);
    const description = MuscleGroupDescription.create(attributes.description);
    const bodyRegion = MuscleGroupBodyRegion.create(attributes.bodyRegion);
    const thumbnailUrl =
      attributes.thumbnailUrl !== undefined
        ? MuscleGroupThumbnailUrl.create(attributes.thumbnailUrl)
        : null;
    const thumbnailStorageKey =
      attributes.thumbnailStorageKey !== undefined
        ? MuscleGroupThumbnailStorageKey.create(attributes.thumbnailStorageKey)
        : null;
    const imageAltText =
      attributes.imageAltText !== undefined
        ? MuscleGroupImageAltText.create(attributes.imageAltText)
        : null;
    const sortOrder = MuscleGroupSortOrder.create(attributes.sortOrder ?? 0);
    const now = new Date();

    return new MuscleGroup({
      id: UniqueId.create().value,
      name: name.value,
      slug: slug.value,
      description: description.value,
      bodyRegion: bodyRegion.value,
      thumbnailUrl: thumbnailUrl?.value ?? null,
      thumbnailStorageKey: thumbnailStorageKey?.value ?? null,
      imageAltText: imageAltText?.value ?? null,
      sortOrder: sortOrder.value,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(attributes: PrimitiveMuscleGroup): MuscleGroup {
    return new MuscleGroup(attributes);
  }

  toValue(): PrimitiveMuscleGroup {
    return {
      id: this.id.value,
      name: this.name,
      slug: this.slug,
      description: this.description,
      bodyRegion: this.bodyRegion,
      thumbnailUrl: this.thumbnailUrl,
      thumbnailStorageKey: this.thumbnailStorageKey,
      imageAltText: this.imageAltText,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
