import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { BudgetModule } from "./budget/budget.module";
import { ChecklistModule } from "./checklist/checklist.module";
import { GuestsModule } from "./guests/guests.module";
import { SeatingModule } from "./seating/seating.module";
import { MicrositeModule } from "./microsite/microsite.module";
import { TasksModule } from "./tasks/tasks.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { BudgetStatsModule } from "./budget-stats/budget-stats.module";
import { GuestsFacadeModule } from "./guests-facade/guests-facade.module";
import { SeatingFacadeModule } from "./seating-facade/seating-facade.module";
import { MicrositeFacadeModule } from "./microsite-facade/microsite-facade.module";
import { PrismaService } from "./common/prisma.service";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    BudgetModule,
    ChecklistModule,
    GuestsModule,
    SeatingFacadeModule, // Before SeatingModule so /tables, /seats, /seats/batch hit facade first
    SeatingModule,
    MicrositeModule,
    TasksModule,
    DashboardModule,
    BudgetStatsModule,
    GuestsFacadeModule,
    MicrositeFacadeModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
