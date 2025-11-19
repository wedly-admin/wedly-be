import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string) {
    // Get user with primary event
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryEventId: true, currency: true, totalBudget: true },
    });

    if (!user || !user.primaryEventId) {
      throw new NotFoundException("User primary event not found");
    }

    const eventId = user.primaryEventId;

    // Get all aggregation data in parallel
    const [checklistItems, guests] = await Promise.all([
      this.prisma.checklistItem.findMany({
        where: { eventId },
        select: {
          status: true,
          advancePayment: true,
        },
      }),
      this.prisma.guest.findMany({
        where: { eventId },
        select: { guests: true },
      }),
    ]);

    // Use user's totalBudget instead of calculating from budgetItems
    const totalBudget = user.totalBudget || 0;

    // Calculate spent from tasks (advance payments)
    const spent = checklistItems.reduce(
      (sum, task) => sum + (task.advancePayment || 0),
      0
    );

    const totalTasks = checklistItems.length;
    const finishedTasks = checklistItems.filter(
      (item) =>
        item.status === "completed" ||
        item.status === "COMPLETED" ||
        item.status === "done"
    ).length;
    // Sum all guests including additional guests (guests field)
    const totalGuests = guests.reduce(
      (sum, guest) => sum + (guest.guests || 1),
      0
    );
    const weddingProgress =
      totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0;

    return {
      data: {
        totalBudget,
        spent,
        remaining: totalBudget - spent,
        totalTasks,
        finishedTasks,
        totalGuests,
        weddingProgress,
        currency: (user.currency || "RSD") as "RSD" | "USD",
      },
    };
  }
}
