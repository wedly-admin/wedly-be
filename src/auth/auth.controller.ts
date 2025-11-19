import { Controller, Post, Body, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./schemas";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  async refresh(@Body() dto: any) {
    return this.authService.refresh(dto.refreshToken);
  }
}
