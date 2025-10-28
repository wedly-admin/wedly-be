import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ChecklistItemSchema, UpdateChecklistItemSchema } from './schemas';

@Controller('events/:eventId/checklist')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(private checklistService: ChecklistService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(ChecklistItemSchema))
  async create(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.checklistService.create(eventId, dto);
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return this.checklistService.findAll(eventId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.checklistService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateChecklistItemSchema))
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.checklistService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.checklistService.remove(id);
  }
}

