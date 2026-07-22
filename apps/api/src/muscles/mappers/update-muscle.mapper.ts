import { Prisma } from '../../../generated/prisma/client';
import { UpdateMuscleDto } from '../dto/update-muscle.dto';
import {
  buildMuscleSlug,
  capitalizeFirstCharacter,
} from './create-muscle.mapper';

export function buildMuscleUpdateData(
  updateMuscleDto: UpdateMuscleDto,
): Prisma.MuscleUncheckedUpdateInput {
  const { name, slug, description, ...rest } = updateMuscleDto;

  return {
    ...rest,
    ...(name !== undefined ? { name: capitalizeFirstCharacter(name) } : {}),
    ...(slug !== undefined ? { slug: buildMuscleSlug(slug) } : {}),
    ...(description !== undefined
      ? { description: capitalizeFirstCharacter(description) }
      : {}),
  };
}
