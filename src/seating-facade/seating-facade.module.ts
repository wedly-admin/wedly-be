import { Module } from "@nestjs/common";
import { SeatingFacadeController } from "./seating-facade.controller";
import { SeatingFacadeService } from "./seating-facade.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [SeatingFacadeController],
  providers: [SeatingFacadeService, PrismaService],
})
export class SeatingFacadeModule {}
