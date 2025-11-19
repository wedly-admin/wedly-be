import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    return this.tasksService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param("id") id: string) {
    return this.tasksService.findOne(req.user.userId, id);
  }

  @Put(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: any) {
    return this.tasksService.update(req.user.userId, id, dto);
  }

  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.tasksService.remove(req.user.userId, id);
  }
}
