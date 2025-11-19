import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class MicrositeFacadeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's primary event ID
   */
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

    const existing = await this.prisma.microsite.findUnique({
      where: { eventId },
    });

    if (existing) {
      return this.prisma.microsite.update({
        where: { eventId },
        data: {
          slug: dto.slug,
          theme: dto.theme,
          draftSections: dto.draftSections,
          seo: dto.seo,
        },
      });
    }

    return this.prisma.microsite.create({
      data: {
        eventId,
        slug: dto.slug,
        theme: dto.theme,
        draftSections: dto.draftSections,
        seo: dto.seo,
        status: "DRAFT",
      },
    });
  }

  async publish(userId: string) {
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
        pubSections: microsite.draftSections,
        status: "PUBLISHED",
      },
    });
  }
}
