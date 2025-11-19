import { Module } from "@nestjs/common";
import { GuestsFacadeController } from "./guests-facade.controller";
import { GuestsFacadeService } from "./guests-facade.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [GuestsFacadeController],
  providers: [GuestsFacadeService, PrismaService],
})
export class GuestsFacadeModule {}
