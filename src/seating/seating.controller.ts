import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { SeatingService } from './seating.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TableSchema, UpdateTableSchema, SeatAssignmentSchema, UpdateSeatAssignmentSchema } from './schemas';

@Controller()
@UseGuards(JwtAuthGuard)
export class SeatingController {
  constructor(private seatingService: SeatingService) {}

  // Tables
  @Post('events/:eventId/tables')
  @UsePipes(new ZodValidationPipe(TableSchema))
  async createTable(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.seatingService.createTable(eventId, dto);
  }

  @Get('events/:eventId/tables')
  async findAllTables(@Param('eventId') eventId: string) {
    return this.seatingService.findAllTables(eventId);
  }

  @Get('tables/:id')
  async findOneTable(@Param('id') id: string) {
    return this.seatingService.findOneTable(id);
  }

  @Patch('tables/:id')
  @UsePipes(new ZodValidationPipe(UpdateTableSchema))
  async updateTable(@Param('id') id: string, @Body() dto: any) {
    return this.seatingService.updateTable(id, dto);
  }

  @Delete('tables/:id')
  async removeTable(@Param('id') id: string) {
    return this.seatingService.removeTable(id);
  }

  // Seat Assignments
  @Post('events/:eventId/seats')
  @UsePipes(new ZodValidationPipe(SeatAssignmentSchema))
  async createSeat(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.seatingService.createSeat(eventId, dto);
  }

  @Get('events/:eventId/seats')
  async findAllSeats(@Param('eventId') eventId: string) {
    return this.seatingService.findAllSeats(eventId);
  }

  @Get('seats/:id')
  async findOneSeat(@Param('id') id: string) {
    return this.seatingService.findOneSeat(id);
  }

  @Patch('seats/:id')
  @UsePipes(new ZodValidationPipe(UpdateSeatAssignmentSchema))
  async updateSeat(@Param('id') id: string, @Body() dto: any) {
    return this.seatingService.updateSeat(id, dto);
  }

  @Delete('seats/:id')
  async removeSeat(@Param('id') id: string) {
    return this.seatingService.removeSeat(id);
  }
}

