import { Module } from "@nestjs/common";
import { MicrositeFacadeController } from "./microsite-facade.controller";
import { MicrositeFacadeService } from "./microsite-facade.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [MicrositeFacadeController],
  providers: [MicrositeFacadeService, PrismaService],
})
export class MicrositeFacadeModule {}
