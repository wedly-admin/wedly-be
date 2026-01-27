import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class MicrositeFacadeService {
  constructor(private prisma: PrismaService) {}

  private async getUserPrimaryEventId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { primaryEventId: true },
    });
    if (!user || !user.primaryEventId) {
      throw new NotFoundException("User primary event not found");
    }
    return user.primaryEventId;
  }

  async get(userId: string) {
    const eventId = await this.getUserPrimaryEventId(userId);
    const microsite = await this.prisma.microsite.findUnique({
      where: { eventId },
    });
    if (!microsite) {
      throw new NotFoundException("Microsite not found");
    }
    return microsite;
  }

  async upsert(userId: string, dto: any) {
    const eventId = await this.getUserPrimaryEventId(userId);

    if (dto.slug != null) {
      const taken = await this.prisma.microsite.findUnique({
        where: { slug: String(dto.slug).trim().toLowerCase() },
      });
      if (taken && taken.eventId !== eventId) {
        throw new ConflictException("Slug already taken");
      }
    }

    const existing = await this.prisma.microsite.findUnique({
      where: { eventId },
    });

    const slug = dto.slug != null ? String(dto.slug).trim().toLowerCase() : undefined;
    const data: any = {};
    if (slug !== undefined) data.slug = slug;
    if (dto.theme !== undefined) data.theme = dto.theme;
    if (dto.draftSections !== undefined) data.draftSections = dto.draftSections;
    if (dto.seo !== undefined) data.seo = dto.seo;

    if (existing) {
      return this.prisma.microsite.update({
        where: { eventId },
        data,
      });
    }

    if (!data.slug) {
      throw new BadRequestException("Slug is required when creating a website");
    }
    return this.prisma.microsite.create({
      data: {
        eventId,
        slug: data.slug,
        theme: data.theme ?? null,
        draftSections: data.draftSections ?? null,
        seo: data.seo ?? null,
        status: "DRAFT",
      },
    });
  }

  async publish(userId: string, shouldPublish: boolean) {
    const eventId = await this.getUserPrimaryEventId(userId);
    const microsite = await this.prisma.microsite.findUnique({
      where: { eventId },
    });
    if (!microsite) {
      throw new NotFoundException("Microsite not found");
    }
    return this.prisma.microsite.update({
      where: { eventId },
      data: {
        pubSections: shouldPublish ? microsite.draftSections : microsite.pubSections,
        status: shouldPublish ? "PUBLISHED" : "DRAFT",
      },
    });
  }

  async regenerateSlug(userId: string, newSlug: string) {
    const eventId = await this.getUserPrimaryEventId(userId);
    const slug = newSlug.trim().toLowerCase();
    const taken = await this.prisma.microsite.findUnique({
      where: { slug },
    });
    if (taken && taken.eventId !== eventId) {
      throw new ConflictException("Slug already taken");
    }
    const microsite = await this.prisma.microsite.findUnique({
      where: { eventId },
    });
    if (!microsite) {
      throw new NotFoundException("Microsite not found");
    }
    return this.prisma.microsite.update({
      where: { eventId },
      data: { slug },
    });
  }
}
