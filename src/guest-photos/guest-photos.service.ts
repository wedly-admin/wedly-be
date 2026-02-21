import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import sharp from "sharp";
import { PrismaService } from "../common/prisma.service";
import { UploadService } from "../upload/upload.service";

const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";

const OBJECT_ID_LENGTH = 24;
const HEX = /^[a-f0-9]+$/;
const MAX_IMAGES_PER_USER = 200;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const COMPRESS_MAX_WIDTH = 1920;
const COMPRESS_JPEG_QUALITY = 82;

function isValidObjectId(id: string): boolean {
  return (
    typeof id === "string" &&
    id.length === OBJECT_ID_LENGTH &&
    HEX.test(id)
  );
}

/** Compress image for guest photos: resize and convert to JPEG. */
async function compressImage(buffer: Buffer): Promise<{ buffer: Buffer; mimetype: string }> {
  const out = await sharp(buffer)
    .resize(COMPRESS_MAX_WIDTH, COMPRESS_MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: COMPRESS_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  return { buffer: out, mimetype: "image/jpeg" };
}

@Injectable()
export class GuestPhotosService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService
  ) {}

  /** Public submit: slug = userId. Validates user exists, compresses, uploads to R2, saves. Max 200 images per user. */
  async submit(
    slug: string,
    files: Express.Multer.File[],
    message?: string
  ): Promise<{ success: boolean }> {
    if (!isValidObjectId(slug)) {
      throw new BadRequestException("Invalid link.");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: slug },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException("Invalid link.");
    }
    if (!files?.length) {
      throw new BadRequestException("At least one photo is required.");
    }
    const submissions = await this.prisma.guestPhotoSubmission.findMany({
      where: { userId: slug },
      select: { imageUrls: true },
    });
    const currentCount = submissions.reduce((sum, s) => sum + s.imageUrls.length, 0);
    if (currentCount >= MAX_IMAGES_PER_USER) {
      throw new BadRequestException(
        `This wedding has reached the maximum of ${MAX_IMAGES_PER_USER} photos.`
      );
    }
    const afterCount = currentCount + files.length;
    if (afterCount > MAX_IMAGES_PER_USER) {
      throw new BadRequestException(
        `You can add at most ${MAX_IMAGES_PER_USER - currentCount} more photos (max ${MAX_IMAGES_PER_USER} total).`
      );
    }
    const urls: string[] = [];
    for (const file of files) {
      if (!file.buffer) continue;
      if (!ALLOWED_MIMES.includes(file.mimetype)) {
        throw new BadRequestException(
          "Invalid file type. Allowed: JPEG, PNG, GIF, WebP."
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException("Each photo must be under 5 MB.");
      }
      const { buffer, mimetype } = await compressImage(file.buffer);
      const { url } = await this.uploadService.uploadGuestPhoto(
        buffer,
        mimetype,
        slug
      );
      urls.push(url);
    }
    if (urls.length === 0) {
      throw new BadRequestException("At least one valid photo is required.");
    }
    await this.prisma.guestPhotoSubmission.create({
      data: {
        userId: slug,
        message: message?.trim()?.slice(0, 500) || null,
        imageUrls: urls,
      },
    });
    return { success: true };
  }

  /** List submissions for the authenticated user and total image count. */
  async listForUser(userId: string): Promise<{
    data: {
      _id: string;
      message: string | null;
      imageUrls: string[];
      createdAt: string;
    }[];
    totalImageCount: number;
  }> {
    const list = await this.prisma.guestPhotoSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        imageUrls: true,
        createdAt: true,
      },
    });
    const totalImageCount = list.reduce((sum, row) => sum + row.imageUrls.length, 0);
    const data = list.map((row) => ({
      _id: row.id,
      message: row.message,
      imageUrls: row.imageUrls,
      createdAt: row.createdAt.toISOString(),
    }));
    return { data, totalImageCount };
  }

  /** Stream a guest photo for download. Validates URL is from our R2 and key belongs to userId. */
  async getDownloadStream(imageUrl: string, userId: string): Promise<{
    body: import("stream").Readable;
    contentType: string;
  }> {
    if (!R2_PUBLIC_URL || !imageUrl.startsWith(R2_PUBLIC_URL)) {
      throw new BadRequestException("Invalid image URL.");
    }
    const key = imageUrl.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
    const prefix = `guest-photos/${userId}/`;
    if (!key.startsWith(prefix)) {
      throw new BadRequestException("You can only download your own photos.");
    }
    const { body, contentType } = await this.uploadService.getObjectStream(key);
    return { body, contentType: contentType ?? "application/octet-stream" };
  }
}
