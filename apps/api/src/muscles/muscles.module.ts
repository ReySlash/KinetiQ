import { Module } from '@nestjs/common';
import { AdminMusclesController } from './admin-muscles.controller';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MusclesController, AdminMusclesController],
  providers: [MusclesService],
})
export class MusclesModule {}
