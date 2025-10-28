import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BudgetItemSchema, UpdateBudgetItemSchema } from './schemas';

@Controller('events/:eventId/budget-items')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(BudgetItemSchema))
  async create(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.budgetService.createItem(eventId, dto);
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return this.budgetService.findAll(eventId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.budgetService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateBudgetItemSchema))
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.budgetService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.budgetService.remove(id);
  }
}

