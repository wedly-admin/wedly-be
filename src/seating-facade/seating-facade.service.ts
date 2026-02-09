import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
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
        order: dto.order ?? 0,
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

    // Validate capacity if being updated
    if (dto.capacity !== undefined) {
      if (dto.capacity < 1) {
        throw new BadRequestException('Table capacity must be at least 1');
      }
      
      // Check if reducing capacity would orphan existing seat assignments
      const currentSeatCount = await this.prisma.seatAssignment.count({
        where: { tableId },
      });
      
      if (dto.capacity < currentSeatCount) {
        throw new BadRequestException(
          `Cannot reduce capacity to ${dto.capacity}. Table currently has ${currentSeatCount} assigned seats.`
        );
      }
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

    // Delete all seat assignments for this table first (cascade delete)
    await this.prisma.seatAssignment.deleteMany({
      where: { tableId },
    });

    return this.prisma.table.delete({
      where: { id: tableId },
    });
  }

  // Seat Assignments
  async createSeat(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

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

  async findAllSeats(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    return this.prisma.seatAssignment.findMany({
      where: { eventId },
      orderBy: [{ tableId: 'asc' }, { position: 'asc' }],
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

    // If changing table, validate new table
    if (dto.tableId && dto.tableId !== seat.tableId) {
      const newTable = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          eventId,
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

  async batchUpdatePositions(
    userId: string,
    updates: Array<{ id: string; position: number }>,
  ) {
    const eventId = await this.getUserPrimaryEventId(userId);

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new BadRequestException('updates must be a non-empty array');
    }

    for (const u of updates) {
      if (typeof u.id !== 'string' || typeof u.position !== 'number') {
        throw new BadRequestException(
          'Each update must have id (string) and position (number)',
        );
      }
    }

    const ids = updates.map((u) => u.id);
    const seats = await this.prisma.seatAssignment.findMany({
      where: { id: { in: ids }, eventId },
    });

    if (seats.length !== ids.length) {
      throw new BadRequestException('Some seat assignments not found in this event');
    }

    const tableIds = [...new Set(seats.map((s) => s.tableId))];
    const tables = await this.prisma.table.findMany({
      where: { id: { in: tableIds } },
    });
    const tableMap = new Map(tables.map((t) => [t.id, t]));

    for (const u of updates) {
      const seat = seats.find((s) => s.id === u.id);
      if (!seat) continue;
      const table = tableMap.get(seat.tableId);
      if (table && u.position >= table.capacity) {
        throw new BadRequestException(
          `Position ${u.position} exceeds table capacity (${table.capacity})`,
        );
      }
    }

    await Promise.all(
      updates.map((u) =>
        this.prisma.seatAssignment.update({
          where: { id: u.id },
          data: { position: u.position },
        }),
      ),
    );

    return this.prisma.seatAssignment.findMany({
      where: { id: { in: ids } },
      orderBy: [{ tableId: 'asc' }, { position: 'asc' }],
    });
  }
}
