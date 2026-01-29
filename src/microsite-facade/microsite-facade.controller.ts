import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { MicrositeFacadeService } from "./microsite-facade.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

const SLUG_REGEX = /^[a-z0-9-]+$/;

@Controller("microsite")
@UseGuards(JwtAuthGuard)
export class MicrositeFacadeController {
  constructor(private micrositeFacadeService: MicrositeFacadeService) { }

  @Get()
  async get(@Req() req: any) {
    return this.micrositeFacadeService.get(req.user.userId);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    validateSlug(dto?.slug, true);
    return this.micrositeFacadeService.upsert(req.user.userId, dto);
  }

  @Patch()
  async update(@Req() req: any, @Body() dto: any) {
    if (dto.slug !== undefined) validateSlug(dto.slug, false);
    return this.micrositeFacadeService.upsert(req.user.userId, dto);
  }

  @Post("publish")
  async publish(@Req() req: any, @Body() body: { publish?: boolean } = {}) {
    const publish = body?.publish !== false;
    return this.micrositeFacadeService.publish(req.user.userId, publish);
  }

  @Post("unpublish")
  async unpublish(@Req() req: any) {
    return this.micrositeFacadeService.publish(req.user.userId, false);
  }

  @Post("regenerate-slug")
  async regenerateSlug(@Req() req: any, @Body() body: { slug: string }) {
    validateSlug(body?.slug, true);
    return this.micrositeFacadeService.regenerateSlug(req.user.userId, body.slug);
  }

  @Delete()
  async delete(@Req() req: any) {
    return this.micrositeFacadeService.delete(req.user.userId);
  }
}

function validateSlug(slug: unknown, required: boolean): asserts slug is string {
  if (slug == null || typeof slug !== "string") {
    if (required) throw new BadRequestException("Slug is required");
    return;
  }
  const s = slug.trim();
  if (s.length < 3) throw new BadRequestException("Slug must be at least 3 characters");
  if (!SLUG_REGEX.test(s)) throw new BadRequestException("Slug may only contain lowercase letters, numbers, and hyphens");
}
