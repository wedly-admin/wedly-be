import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { MicrositeFacadeService } from "./microsite-facade.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("microsite")
@UseGuards(JwtAuthGuard)
export class MicrositeFacadeController {
  constructor(private micrositeFacadeService: MicrositeFacadeService) {}

  @Get()
  async get(@Req() req: any) {
    return this.micrositeFacadeService.get(req.user.userId);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    return this.micrositeFacadeService.upsert(req.user.userId, dto);
  }

  @Patch()
  async update(@Req() req: any, @Body() dto: any) {
    return this.micrositeFacadeService.upsert(req.user.userId, dto);
  }

  @Post("publish")
  async publish(@Req() req: any) {
    return this.micrositeFacadeService.publish(req.user.userId);
  }
}
