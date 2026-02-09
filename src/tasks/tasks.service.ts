import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class TasksService {
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

  /**
   * Transform ChecklistItem from database to Task format expected by frontend
   */
  private transformToTask(item: any) {
    return {
      id: item.id, // Will be transformed to _id by interceptor
      title: item.title,
      note: item.description || "", // Map description → note
      price: item.price || 0,
      advancePayment: item.advancePayment || 0,
      status: item.status,
      createdAt: item.createdAt
        ? item.createdAt.toISOString()
        : new Date().toISOString(),
    };
  }

  async create(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const item = await this.prisma.checklistItem.create({
      data: {
        eventId,
        title: dto.title,
        description: dto.note, // Map note → description
        status: dto.status || "pending",
        price: dto.price,
        advancePayment: dto.advancePayment,
        order: 0,
      },
    });

    return this.transformToTask(item);
  }

  async findAll(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const items = await this.prisma.checklistItem.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => this.transformToTask(item));
  }

  async findOne(userId: string, taskId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);

    const item = await this.prisma.checklistItem.findUnique({
      where: { id: taskId },
    });

    if (!item) {
      throw new NotFoundException("Task not found");
    }

    // Verify the task belongs to the user's event
    if (item.eventId !== eventId) {
      throw new ForbiddenException("Access denied");
    }

    return this.transformToTask(item);
  }

  async update(userId: string, taskId: string, dto: any) {
    // Verify access
    await this.findOne(userId, taskId);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.note !== undefined) updateData.description = dto.note; // Map note → description
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.advancePayment !== undefined)
      updateData.advancePayment = dto.advancePayment;

    const item = await this.prisma.checklistItem.update({
      where: { id: taskId },
      data: updateData,
    });

    return this.transformToTask(item);
  }

  async remove(userId: string, taskId: string) {
    // Verify access
    await this.findOne(userId, taskId);

    await this.prisma.checklistItem.delete({
      where: { id: taskId },
    });

    return { success: true };
  }
}
