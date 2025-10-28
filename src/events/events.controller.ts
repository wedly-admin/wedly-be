import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, UsePipes } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateEventSchema, UpdateEventSchema } from './schemas';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateEventSchema))
  async create(@Req() req: any, @Body() dto: any) {
    return this.eventsService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Query('ownerId') ownerId?: string) {
    return this.eventsService.findAll(ownerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateEventSchema))
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    return this.eventsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.remove(id, req.user.userId);
  }
}

