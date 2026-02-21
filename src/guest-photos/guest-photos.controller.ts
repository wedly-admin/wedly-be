import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Query,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  StreamableFile,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import { GuestPhotosService } from "./guest-photos.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

/** Multipart body can be object or array depending on parser; extract message safely. */
function getMessage(body: unknown): string | undefined {
  if (body && typeof body === "object" && !Array.isArray(body) && "message" in body) {
    const m = (body as { message?: unknown }).message;
    return typeof m === "string" ? m : undefined;
  }
  return undefined;
}

@Controller("guest-photos")
export class GuestPhotosController {
  constructor(private guestPhotosService: GuestPhotosService) {}

  /** Protected: list submissions for the current user. */
  @Get("submissions")
  @UseGuards(JwtAuthGuard)
  async listSubmissions(@Req() req: { user: { userId: string } }) {
    return this.guestPhotosService.listForUser(req.user.userId);
  }

  /** Protected: download a single guest photo by image URL (proxy from R2 to avoid CORS). */
  @Get("download")
  @UseGuards(JwtAuthGuard)
  async download(
    @Req() req: { user: { userId: string } },
    @Query("url") url: string
  ) {
    if (!url || typeof url !== "string") {
      throw new BadRequestException("Missing url parameter.");
    }
    const { body, contentType } = await this.guestPhotosService.getDownloadStream(
      decodeURIComponent(url),
      req.user.userId
    );
    const filename = decodeURIComponent(url).split("/").pop() ?? "photo.jpg";
    return new StreamableFile(body, {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  /** Public: submit photos via QR link. Slug = userId. No Zod on body: multipart can be object or array. */
  @Post(":slug/submit")
  @UseInterceptors(
    FilesInterceptor("photos", 10, { storage: multer.memoryStorage() })
  )
  async submit(
    @Param("slug") slug: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: unknown
  ) {
    return this.guestPhotosService.submit(
      slug,
      files || [],
      getMessage(body)
    );
  }
}
