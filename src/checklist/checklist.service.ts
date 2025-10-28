import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ChecklistService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, dto: any) {
    return this.prisma.checklistItem.create({
      data: {
        eventId,
        title: dto.title,
        description: dto.description,
        status: dto.status || 'TODO',
        dueDate: dto.dueDate,
        assigneeId: dto.assigneeId,
        order: dto.order || 0,
      },
    });
  }

  async findAll(eventId: string) {
    return this.prisma.checklistItem.findMany({
      where: { eventId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.checklistItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }
    return item;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.checklistItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.checklistItem.delete({ where: { id } });
  }
}

