import { Controller, Get, Patch, Post, Body, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get("me")
  async getMe(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return null;
    }

    const d = user.weddingDate;
    const weddingDateStr = d ? d.toISOString() : "";

    return {
      user: {
        _id: user.id,
        id: user.id,
        email: user.email,
        groomFullName: user.groomFullName || "",
        brideFullName: user.brideFullName || "",
        weddingDate: weddingDateStr,
        weddingDetails: {
          date: weddingDateStr,
          country: user.weddingCountry || "",
          city: user.weddingCity || "",
        },
        currency: user.currency || "USD",
        totalBudget: user.totalBudget ?? 0,
        defaultTableCapacity: user.defaultTableCapacity ?? 12,
      },
    };
  }

  @Patch("me")
  async updateMe(@Req() req: any, @Body() dto: any) {
    return this.usersService.update(req.user.userId, dto);
  }

  @Post("me/change-password")
  async changePassword(@Req() req: any, @Body() dto: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }
}
