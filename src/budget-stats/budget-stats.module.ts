import { Module } from "@nestjs/common";
import { BudgetStatsController } from "./budget-stats.controller";
import { BudgetStatsService } from "./budget-stats.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [BudgetStatsController],
  providers: [BudgetStatsService, PrismaService],
})
export class BudgetStatsModule {}
