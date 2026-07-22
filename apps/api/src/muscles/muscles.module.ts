import { Module } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MusclesController],
  providers: [MusclesService],
})
export class MusclesModule {}
