import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async createItem(eventId: string, dto: any) {
    return this.prisma.budgetItem.create({
      data: {
        eventId,
        category: dto.category,
        title: dto.title,
        planned: dto.planned || 0,
        paid: dto.paid || 0,
        vendorId: dto.vendorId,
        dueDate: dto.dueDate,
        status: dto.status || 'TODO',
        notes: dto.notes,
        order: dto.order || 0,
      },
    });
  }

  async findAll(eventId: string) {
    return this.prisma.budgetItem.findMany({
      where: { eventId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.budgetItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Budget item not found');
    }
    return item;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.budgetItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.budgetItem.delete({ where: { id } });
  }
}

