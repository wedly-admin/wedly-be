import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GuestSchema, UpdateGuestSchema } from './schemas';

@Controller('events/:eventId/guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(GuestSchema))
  async create(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.guestsService.create(eventId, dto);
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return this.guestsService.findAll(eventId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateGuestSchema))
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.guestsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }
}

