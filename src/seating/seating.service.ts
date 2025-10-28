import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SeatingService {
  constructor(private prisma: PrismaService) {}

  // Tables
  async createTable(eventId: string, dto: any) {
    return this.prisma.table.create({
      data: {
        eventId,
        name: dto.name,
        capacity: dto.capacity || 8,
        side: dto.side,
        order: dto.order || 0,
      },
    });
  }

  async findAllTables(eventId: string) {
    return this.prisma.table.findMany({
      where: { eventId },
      orderBy: { order: 'asc' },
    });
  }

  async findOneTable(id: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async updateTable(id: string, dto: any) {
    await this.findOneTable(id);
    return this.prisma.table.update({
      where: { id },
      data: dto,
    });
  }

  async removeTable(id: string) {
    await this.findOneTable(id);
    return this.prisma.table.delete({ where: { id } });
  }

  // Seat Assignments
  async createSeat(eventId: string, dto: any) {
    return this.prisma.seatAssignment.create({
      data: {
        eventId,
        tableId: dto.tableId,
        guestId: dto.guestId,
        position: dto.position || 0,
      },
    });
  }

  async findAllSeats(eventId: string) {
    return this.prisma.seatAssignment.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
    });
  }

  async findOneSeat(id: string) {
    const seat = await this.prisma.seatAssignment.findUnique({ where: { id } });
    if (!seat) {
      throw new NotFoundException('Seat assignment not found');
    }
    return seat;
  }

  async updateSeat(id: string, dto: any) {
    await this.findOneSeat(id);
    return this.prisma.seatAssignment.update({
      where: { id },
      data: dto,
    });
  }

  async removeSeat(id: string) {
    await this.findOneSeat(id);
    return this.prisma.seatAssignment.delete({ where: { id } });
  }
}

