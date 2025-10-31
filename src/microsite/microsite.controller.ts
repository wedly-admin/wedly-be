import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { MicrositeService } from './microsite.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  MicrositeUpsertSchema,
  MicrositePublishSchema,
  MicrositePreviewTokenSchema,
  MediaAssetSchema,
} from './schemas';

@Controller()
export class MicrositeController {
  constructor(private micrositeService: MicrositeService) {}

  // Admin routes (protected)
  @Put('events/:eventId/microsite')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(MicrositeUpsertSchema))
  async upsert(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.micrositeService.upsert(eventId, dto);
  }

  @Get('events/:eventId/microsite')
  @UseGuards(JwtAuthGuard)
  async get(@Param('eventId') eventId: string) {
    return this.micrositeService.get(eventId);
  }

  @Post('events/:eventId/microsite/publish')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(MicrositePublishSchema))
  async publish(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.micrositeService.publish(eventId, dto.publish);
  }

  @Post('events/:eventId/microsite/preview-token')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(MicrositePreviewTokenSchema))
  async togglePreviewToken(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.micrositeService.togglePreviewToken(eventId, dto.enable);
  }

  @Post('events/:eventId/assets')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(MediaAssetSchema))
  async createAsset(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.micrositeService.createAsset(eventId, dto);
  }

  @Get('events/:eventId/assets')
  @UseGuards(JwtAuthGuard)
  async listAssets(@Param('eventId') eventId: string) {
    return this.micrositeService.listAssets(eventId);
  }

  // Public routes
  @Get('m/:slug')
  async getPublic(@Param('slug') slug: string) {
    return this.micrositeService.getPublicBySlug(slug);
  }

  @Get('m/:slug/preview')
  async getPreview(@Param('slug') slug: string, @Query('token') token: string) {
    return this.micrositeService.getPreviewBySlug(slug, token);
  }
}

