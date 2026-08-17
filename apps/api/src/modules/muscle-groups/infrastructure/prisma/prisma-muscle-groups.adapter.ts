import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { MuscleGroupQueryError } from '../../application/errors/muscle-group.errors';
import type { MuscleGroupDetail } from '../../application/models/detail-muscle-group.models';
import type { MuscleGroupListItem } from '../../application/models/list-muscle-groups.models';
import { MuscleGroupsQueriesPort } from '../../application/ports/muscle-groups-queries.port';
import {
  muscleGroupDetailSelect,
  muscleGroupListSelect,
  toDetail,
  toListItem,
} from './prisma-muscle-groups.mapper';

@Injectable()
export class PrismaMuscleGroupsAdapter implements MuscleGroupsQueriesPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<MuscleGroupListItem[]> {
    try {
      const rows = await this.prisma.muscleGroup.findMany({
        select: muscleGroupListSelect,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });

      return rows.map(toListItem);
    } catch {
      throw new MuscleGroupQueryError();
    }
  }

  async findBySlug(slug: string): Promise<MuscleGroupDetail | null> {
    try {
      const row = await this.prisma.muscleGroup.findUnique({
        where: { slug },
        select: muscleGroupDetailSelect,
      });

      return row ? toDetail(row) : null;
    } catch {
      throw new MuscleGroupQueryError();
    }
  }
}
