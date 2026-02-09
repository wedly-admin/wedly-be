import {
  BadRequestException,
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

type BatchSeatUpdatesDto = { updates: Array<{ id: string; position: number }> };

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

  /** Must be declared before seats/:id so /seats/batch does not match :id */
  @Patch("seats/batch")
  async batchUpdateSeats(@Req() req: any, @Body() dto: BatchSeatUpdatesDto) {
    const body = normalizeBody(dto);
    if (!body?.updates || !Array.isArray(body.updates)) {
      throw new BadRequestException(
        "Body must be { updates: [{ id: string, position: number }, ...] }",
      );
    }
    return this.seatingFacadeService.batchUpdatePositions(
      req.user.userId,
      body.updates,
    );
  }

  @Patch("seats/:id")
  async updateSeat(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    const body = normalizeBody(dto);
    return this.seatingFacadeService.updateSeat(req.user.userId, id, body);
  }

  @Delete("seats/:id")
  async removeSeat(@Req() req: any, @Param("id") id: string) {
    return this.seatingFacadeService.removeSeat(req.user.userId, id);
  }
}

function normalizeBody(value: any): Record<string, any> {
  if (value == null) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }
  return {};
}
