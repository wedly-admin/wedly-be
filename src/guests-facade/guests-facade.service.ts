import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class GuestsFacadeService {
  constructor(private prisma: PrismaService) { }

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

  async create(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    // Ensure side and status are valid enum values
    const validSide = ["BRIDE", "GROOM", "BOTH", "OTHER"].includes(dto.side)
      ? dto.side
      : "OTHER";
    const validStatus = ["PENDING", "COMING", "NOT_COMING"].includes(dto.status)
      ? dto.status
      : "PENDING";

    return this.prisma.guest.create({
      data: {
        eventId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        side: validSide,
        status: validStatus,
        tags: dto.tags || [],
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    return this.prisma.guest.findMany({
      where: { eventId },
      orderBy: { firstName: "asc" },
    });
  }

  async findOne(userId: string, guestId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    // Verify guest belongs to user's event
    if (guest.eventId !== eventId) {
      throw new NotFoundException("Guest not found");
    }

    return guest;
  }

  async update(userId: string, guestId: string, dto: any) {
    // Verify access
    await this.findOne(userId, guestId);

    // Ensure side and status are valid enum values if provided
    const updateData: any = { ...dto };
    delete updateData.guests; // no longer used
    if (dto.side && !["BRIDE", "GROOM", "BOTH", "OTHER"].includes(dto.side)) {
      updateData.side = "OTHER";
    }
    if (
      dto.status &&
      !["PENDING", "COMING", "NOT_COMING"].includes(dto.status)
    ) {
      updateData.status = "PENDING";
    }

    return this.prisma.guest.update({
      where: { id: guestId },
      data: updateData,
    });
  }

  async remove(userId: string, guestId: string) {
    // Verify access
    await this.findOne(userId, guestId);

    return this.prisma.guest.delete({
      where: { id: guestId },
    });
  }
}
