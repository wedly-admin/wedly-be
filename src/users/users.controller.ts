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
    const dateStr = d
      ? `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${d.getFullYear()}`
      : "";

    return {
      user: {
        id: user.id,
        email: user.email,
        groomFullName: user.groomFullName || "",
        brideFullName: user.brideFullName || "",
        weddingDetails: {
          date: dateStr,
          country: user.weddingCountry || "",
          city: user.weddingCity || "",
        },
        currency: user.currency || "RSD",
        totalBudget: user.totalBudget || 0,
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
