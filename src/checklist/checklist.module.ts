import { Module } from '@nestjs/common';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ChecklistController],
  providers: [ChecklistService, PrismaService],
  exports: [ChecklistService],
})
export class ChecklistModule {}

