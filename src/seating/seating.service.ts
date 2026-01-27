import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SeatingService {
  constructor(private prisma: PrismaService) {}

  // Tables
  async createTable(eventId: string, dto: any) {
    // Validate capacity
    if (dto.capacity && dto.capacity < 1) {
      throw new BadRequestException('Table capacity must be at least 1');
    }

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
    const table = await this.findOneTable(id);
    
    // Validate capacity if being updated
    if (dto.capacity !== undefined) {
      if (dto.capacity < 1) {
        throw new BadRequestException('Table capacity must be at least 1');
      }
      
      // Check if reducing capacity would orphan existing seat assignments
      const currentSeatCount = await this.prisma.seatAssignment.count({
        where: { tableId: id },
      });
      
      if (dto.capacity < currentSeatCount) {
        throw new BadRequestException(
          `Cannot reduce capacity to ${dto.capacity}. Table currently has ${currentSeatCount} assigned seats.`
        );
      }
    }

    return this.prisma.table.update({
      where: { id },
      data: dto,
    });
  }

  async removeTable(id: string) {
    const table = await this.findOneTable(id);
    
    // Delete all seat assignments for this table first (cascade delete)
    await this.prisma.seatAssignment.deleteMany({
      where: { tableId: id },
    });
    
    return this.prisma.table.delete({ where: { id } });
  }

  // Seat Assignments
  async createSeat(eventId: string, dto: any) {
    // Validate table exists and belongs to the event
    const table = await this.prisma.table.findFirst({
      where: {
        id: dto.tableId,
        eventId,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in this event');
    }

    // Validate guest exists and belongs to the event
    const guest = await this.prisma.guest.findFirst({
      where: {
        id: dto.guestId,
        eventId,
      },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found in this event');
    }

    // Check if guest is already assigned (unique constraint will also catch this)
    const existingAssignment = await this.prisma.seatAssignment.findFirst({
      where: {
        eventId,
        guestId: dto.guestId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Guest is already assigned to a table');
    }

    // Check table capacity
    const currentSeatCount = await this.prisma.seatAssignment.count({
      where: { tableId: dto.tableId },
    });

    if (currentSeatCount >= table.capacity) {
      throw new BadRequestException(
        `Table is at full capacity (${table.capacity} seats)`
      );
    }

    return this.prisma.seatAssignment.create({
      data: {
        eventId,
        tableId: dto.tableId,
        guestId: dto.guestId,
        position: dto.position ?? 0,
      },
    });
  }

  async findAllSeats(eventId: string) {
    return this.prisma.seatAssignment.findMany({
      where: { eventId },
      orderBy: [{ tableId: 'asc' }, { position: 'asc' }],
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
    const seat = await this.findOneSeat(id);

    // If changing table, validate new table
    if (dto.tableId && dto.tableId !== seat.tableId) {
      const newTable = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          eventId: seat.eventId,
        },
      });

      if (!newTable) {
        throw new NotFoundException('New table not found in this event');
      }

      // Check new table capacity
      const currentSeatCount = await this.prisma.seatAssignment.count({
        where: { tableId: dto.tableId },
      });

      if (currentSeatCount >= newTable.capacity) {
        throw new BadRequestException(
          `Table is at full capacity (${newTable.capacity} seats)`
        );
      }
    }

    // Validate position if provided
    if (dto.position !== undefined) {
      const tableId = dto.tableId || seat.tableId;
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
      });

      if (table && dto.position >= table.capacity) {
        throw new BadRequestException(
          `Position ${dto.position} exceeds table capacity (${table.capacity})`
        );
      }
    }

    return this.prisma.seatAssignment.update({
      where: { id },
      data: dto,
    });
  }

  async batchUpdatePositions(eventId: string, updates: Array<{ id: string; position: number }>) {
    // Validate all updates belong to the event
    const seatIds = updates.map((u) => u.id);
    const seats = await this.prisma.seatAssignment.findMany({
      where: {
        id: { in: seatIds },
        eventId,
      },
    });

    if (seats.length !== updates.length) {
      throw new BadRequestException('Some seat assignments not found in this event');
    }

    // Validate positions don't exceed table capacity
    // Group updates by tableId for efficiency
    const tableIds = [...new Set(seats.map((s) => s.tableId))];
    const tables = await this.prisma.table.findMany({
      where: { id: { in: tableIds } },
    });

    const tableMap = new Map(tables.map((t) => [t.id, t]));

    for (const update of updates) {
      const seat = seats.find((s) => s.id === update.id);
      if (!seat) continue;

      const table = tableMap.get(seat.tableId);
      if (table && update.position >= table.capacity) {
        throw new BadRequestException(
          `Position ${update.position} exceeds table capacity (${table.capacity})`
        );
      }
    }

    // Perform batch update
    const updatePromises = updates.map((update) =>
      this.prisma.seatAssignment.update({
        where: { id: update.id },
        data: { position: update.position },
      })
    );

    return Promise.all(updatePromises);
  }

  async removeSeat(id: string) {
    await this.findOneSeat(id);
    return this.prisma.seatAssignment.delete({ where: { id } });
  }
}

