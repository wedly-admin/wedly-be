import { Controller, Post, Body, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
} from "./schemas";

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

  @Post("forgot-password")
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() dto: any) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() dto: any) {
    return this.authService.resetPassword(dto);
  }

  @Post("verify-email")
  @UsePipes(new ZodValidationPipe(VerifyEmailSchema))
  async verifyEmail(@Body() dto: { token: string }) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post("resend-verification")
  @UsePipes(new ZodValidationPipe(ResendVerificationSchema))
  async resendVerification(@Body() dto: { email: string }) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
