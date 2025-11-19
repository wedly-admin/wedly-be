import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { GuestsFacadeService } from "./guests-facade.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("guests")
@UseGuards(JwtAuthGuard)
export class GuestsFacadeController {
  constructor(private guestsFacadeService: GuestsFacadeService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    return this.guestsFacadeService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.guestsFacadeService.findAll(req.user.userId);
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param("id") id: string) {
    return this.guestsFacadeService.findOne(req.user.userId, id);
  }

  @Patch(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.guestsFacadeService.update(req.user.userId, id, dto);
  }

  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.guestsFacadeService.remove(req.user.userId, id);
  }
}
