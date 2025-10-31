import { Module } from '@nestjs/common';
import { MicrositeController } from './microsite.controller';
import { MicrositeService } from './microsite.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MicrositeController],
  providers: [MicrositeService, PrismaService],
  exports: [MicrositeService],
})
export class MicrositeModule {}

