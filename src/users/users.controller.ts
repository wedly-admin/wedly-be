import { Controller, Get, Patch, Body, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  async getMe(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return null;
    }

    // Transform to match frontend expectations
    return {
      user: {
        id: user.id, // Will be transformed to _id by TransformIdInterceptor
        email: user.email,
        groomFullName: user.groomFullName || "",
        brideFullName: user.brideFullName || "",
        weddingDetails: {
          date: user.weddingDate ? user.weddingDate.toISOString() : "",
          country: user.weddingCountry || "",
          city: user.weddingCity || "",
        },
        currency: user.currency || "RSD",
        totalBudget: user.totalBudget || 0,
      },
    };
  }

  @Patch("me")
  async updateMe(@Req() req: any, @Body() dto: any) {
    return this.usersService.update(req.user.userId, dto);
  }
}
