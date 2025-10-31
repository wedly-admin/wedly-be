import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class MicrositeService {
  constructor(private prisma: PrismaService) {}

  async upsert(eventId: string, dto: any) {
    // Check if slug is already taken by another event
    if (dto.slug) {
      const existing = await this.prisma.microsite.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.eventId !== eventId) {
        throw new ConflictException('Slug already taken');
      }
    }

    const microsite = await this.prisma.microsite.findUnique({ where: { eventId } });

    if (microsite) {
      return this.prisma.microsite.update({
        where: { eventId },
        data: {
          slug: dto.slug,
          theme: dto.theme,
          seo: dto.seo,
          draftSections: dto.sections || [],
        },
      });
    }

    return this.prisma.microsite.create({
      data: {
        eventId,
        slug: dto.slug,
        theme: dto.theme,
        seo: dto.seo,
        draftSections: dto.sections || [],
        status: 'DRAFT',
      },
    });
  }

  async get(eventId: string) {
    const microsite = await this.prisma.microsite.findUnique({ where: { eventId } });
    if (!microsite) {
      throw new NotFoundException('Microsite not found');
    }
    return microsite;
  }

  async publish(eventId: string, shouldPublish: boolean) {
    const microsite = await this.get(eventId);

    return this.prisma.microsite.update({
      where: { eventId },
      data: {
        pubSections: shouldPublish ? microsite.draftSections : microsite.pubSections,
        status: shouldPublish ? 'PUBLISHED' : 'DRAFT',
      },
    });
  }

  async togglePreviewToken(eventId: string, enable: boolean) {
    const token = enable ? randomBytes(16).toString('hex') : null;
    
    return this.prisma.microsite.update({
      where: { eventId },
      data: { previewToken: token },
    });
  }

  async getPublicBySlug(slug: string) {
    const microsite = await this.prisma.microsite.findUnique({ where: { slug } });
    
    if (!microsite || microsite.status !== 'PUBLISHED') {
      throw new NotFoundException('Microsite not found');
    }

    return {
      theme: microsite.theme,
      seo: microsite.seo,
      sections: microsite.pubSections,
    };
  }

  async getPreviewBySlug(slug: string, token: string) {
    const microsite = await this.prisma.microsite.findUnique({ where: { slug } });
    
    if (!microsite) {
      throw new NotFoundException('Microsite not found');
    }

    if (!microsite.previewToken || microsite.previewToken !== token) {
      throw new UnauthorizedException('Invalid preview token');
    }

    return {
      theme: microsite.theme,
      seo: microsite.seo,
      sections: microsite.draftSections,
    };
  }

  async createAsset(eventId: string, dto: any) {
    return this.prisma.mediaAsset.create({
      data: {
        eventId,
        url: dto.url,
        kind: dto.kind,
        alt: dto.alt,
        meta: dto.meta,
      },
    });
  }

  async listAssets(eventId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

