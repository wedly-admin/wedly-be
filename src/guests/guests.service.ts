import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, dto: any) {
    return this.prisma.guest.create({
      data: {
        eventId,
        groupId: dto.groupId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        side: dto.side || 'OTHER',
        status: dto.status || 'PENDING',
        guests: dto.guests || 1,
        tags: dto.tags || [],
        notes: dto.notes,
        seatId: dto.seatId,
      },
    });
  }

  async findAll(eventId: string) {
    return this.prisma.guest.findMany({
      where: { eventId },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
    return guest;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.guest.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.guest.delete({ where: { id } });
  }
}

