import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { MusclesService } from './muscles.service';

@Controller('admin/muscles')
@Roles(['ADMIN'])
export class AdminMusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Post()
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.musclesService.create(createMuscleDto);
  }

  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body() updateMuscleDto: UpdateMuscleDto,
  ) {
    return this.musclesService.update(slug, updateMuscleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musclesService.remove(id);
  }
}
