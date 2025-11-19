import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class SeatingFacadeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's primary event ID
   */
  private async getUserPrimaryEventId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryEventId: true },
    });

    if (!user || !user.primaryEventId) {
      throw new NotFoundException("User primary event not found");
    }

    return user.primaryEventId;
  }

  // Tables
  async createTable(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

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

  async findAllTables(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    return this.prisma.table.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
    });
  }

  async updateTable(userId: string, tableId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.eventId !== eventId) {
      throw new NotFoundException("Table not found");
    }

    return this.prisma.table.update({
      where: { id: tableId },
      data: dto,
    });
  }

  async removeTable(userId: string, tableId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.eventId !== eventId) {
      throw new NotFoundException("Table not found");
    }

    return this.prisma.table.delete({
      where: { id: tableId },
    });
  }

  // Seat Assignments
  async createSeat(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    return this.prisma.seatAssignment.create({
      data: {
        eventId,
        tableId: dto.tableId,
        guestId: dto.guestId,
        position: dto.position || 0,
      },
    });
  }

  async findAllSeats(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    return this.prisma.seatAssignment.findMany({
      where: { eventId },
    });
  }

  async updateSeat(userId: string, seatId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const seat = await this.prisma.seatAssignment.findUnique({
      where: { id: seatId },
    });

    if (!seat || seat.eventId !== eventId) {
      throw new NotFoundException("Seat assignment not found");
    }

    return this.prisma.seatAssignment.update({
      where: { id: seatId },
      data: dto,
    });
  }

  async removeSeat(userId: string, seatId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const seat = await this.prisma.seatAssignment.findUnique({
      where: { id: seatId },
    });

    if (!seat || seat.eventId !== eventId) {
      throw new NotFoundException("Seat assignment not found");
    }

    return this.prisma.seatAssignment.delete({
      where: { id: seatId },
    });
  }
}
