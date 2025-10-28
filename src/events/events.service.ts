import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: any) {
    return this.prisma.event.create({
      data: {
        ownerId,
        title: dto.title,
        date: dto.date,
        locale: dto.locale || 'sr',
        sectionsI18n: dto.sectionsI18n,
      },
    });
  }

  async findAll(ownerId?: string) {
    return this.prisma.event.findMany({
      where: ownerId ? { ownerId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (userId && event.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return event;
  }

  async update(id: string, userId: string, dto: any) {
    const event = await this.findOne(id, userId);
    return this.prisma.event.update({
      where: { id: event.id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id, userId);
    return this.prisma.event.delete({ where: { id: event.id } });
  }
}

