import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BudgetModule } from './budget/budget.module';
import { ChecklistModule } from './checklist/checklist.module';
import { GuestsModule } from './guests/guests.module';
import { SeatingModule } from './seating/seating.module';
import { MicrositeModule } from './microsite/microsite.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    BudgetModule,
    ChecklistModule,
    GuestsModule,
    SeatingModule,
    MicrositeModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

