import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class BudgetStatsService {
  constructor(private prisma: PrismaService) {}

  async getBudgetStats(userId: string) {
    // Get user with primary event
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryEventId: true, currency: true, totalBudget: true },
    });

    if (!user || !user.primaryEventId) {
      throw new NotFoundException("User primary event not found");
    }

    const eventId = user.primaryEventId;

    // Get all tasks (checklist items) for the event
    const tasks = await this.prisma.checklistItem.findMany({
      where: { eventId },
      select: {
        price: true,
        advancePayment: true,
        status: true,
      },
    });

    // Use user's totalBudget instead of calculating from tasks
    const totalBudget = user.totalBudget || 0;
    const spent = tasks.reduce(
      (sum, task) => sum + (task.advancePayment || 0),
      0
    );
    const remaining = totalBudget - spent;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) =>
        task.status === "completed" ||
        task.status === "COMPLETED" ||
        task.status === "done"
    ).length;

    return {
      totalBudget,
      spent,
      remaining,
      totalTasks,
      completedTasks,
      currency: (user.currency || "RSD") as "RSD" | "USD",
    };
  }
}
