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
import { SeatingFacadeService } from "./seating-facade.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller()
@UseGuards(JwtAuthGuard)
export class SeatingFacadeController {
  constructor(private seatingFacadeService: SeatingFacadeService) {}

  // Tables
  @Post("tables")
  async createTable(@Req() req: any, @Body() dto: any) {
    return this.seatingFacadeService.createTable(req.user.userId, dto);
  }

  @Get("tables")
  async findAllTables(@Req() req: any) {
    return this.seatingFacadeService.findAllTables(req.user.userId);
  }

  @Patch("tables/:id")
  async updateTable(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: any
  ) {
    return this.seatingFacadeService.updateTable(req.user.userId, id, dto);
  }

  @Delete("tables/:id")
  async removeTable(@Req() req: any, @Param("id") id: string) {
    return this.seatingFacadeService.removeTable(req.user.userId, id);
  }

  // Seat Assignments
  @Post("seats")
  async createSeat(@Req() req: any, @Body() dto: any) {
    return this.seatingFacadeService.createSeat(req.user.userId, dto);
  }

  @Get("seats")
  async findAllSeats(@Req() req: any) {
    return this.seatingFacadeService.findAllSeats(req.user.userId);
  }

  @Patch("seats/:id")
  async updateSeat(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.seatingFacadeService.updateSeat(req.user.userId, id, dto);
  }

  @Delete("seats/:id")
  async removeSeat(@Req() req: any, @Param("id") id: string) {
    return this.seatingFacadeService.removeSeat(req.user.userId, id);
  }
}
