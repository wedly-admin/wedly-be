import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { BudgetStatsService } from "./budget-stats.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("budget-stats")
@UseGuards(JwtAuthGuard)
export class BudgetStatsController {
  constructor(private budgetStatsService: BudgetStatsService) {}

  @Get()
  async getBudgetStats(@Req() req: any) {
    return this.budgetStatsService.getBudgetStats(req.user.userId);
  }
}
