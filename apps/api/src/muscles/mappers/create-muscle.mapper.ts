import { randomUUID } from 'crypto';
import { Prisma } from '../../../generated/prisma/client';
import { CreateMuscleDto } from '../dto/create-muscle.dto';

export function capitalizeFirstCharacter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildMuscleSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildMuscleCreateData(
  createMuscleDto: CreateMuscleDto,
): Prisma.MuscleUncheckedCreateInput {
  const name = capitalizeFirstCharacter(createMuscleDto.name);
  const slugSource = createMuscleDto.slug ?? name;
  const description = capitalizeFirstCharacter(createMuscleDto.description);
  return {
    id: randomUUID(),
    name,
    slug: buildMuscleSlug(slugSource),
    description,
    bodyRegion: createMuscleDto.bodyRegion,
    thumbnailUrl: createMuscleDto.thumbnailUrl ?? null,
    thumbnailStorageKey: createMuscleDto.thumbnailStorageKey ?? null,
    imageAltText: createMuscleDto.imageAltText ?? null,
    muscleGroupId: createMuscleDto.muscleGroupId ?? null,
    parentId: createMuscleDto.parentId ?? null,
    sortOrder: createMuscleDto.sortOrder ?? 0,
  };
}
