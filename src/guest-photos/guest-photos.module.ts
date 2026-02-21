import { Module } from "@nestjs/common";
import { GuestPhotosController } from "./guest-photos.controller";
import { GuestPhotosService } from "./guest-photos.service";
import { PrismaService } from "../common/prisma.service";
import { UploadModule } from "../upload/upload.module";

@Module({
  imports: [UploadModule],
  controllers: [GuestPhotosController],
  providers: [GuestPhotosService, PrismaService],
})
export class GuestPhotosModule {}
