import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import { PrismaService } from "../common/prisma.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mail: MailService,
  ) {}

  // ... (previous methods)

  async forgotPassword(dto: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // For security, don't reveal that user doesn't exist
      return { message: "If an account exists with this email, you will receive a reset link." };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${base}/auth/reset-password?token=${token}`;
    const sent = await this.mail.sendPasswordResetEmail(user.email, resetUrl);
    if (!sent) {
      throw new BadRequestException("We could not send the email. Please try again in a few minutes.");
    }
    return { message: "If an account exists with this email, you will receive a reset link." };
  }

  async resetPassword(dto: { token: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: "Password has been reset successfully." };
  }

  async register(dto: {
    email: string;
    password: string;
    name?: string;
    brideFullName?: string;
    groomFullName?: string;
    weddingDate?: string;
    location?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException("User with this email already exists");
    }

    const weddingDateParsed = dto.weddingDate
      ? new Date(dto.weddingDate)
      : undefined;

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        brideFullName: dto.brideFullName,
        groomFullName: dto.groomFullName,
        weddingDate: weddingDateParsed,
        weddingCity: dto.location,
        // [VERIFICATION_OFF] odmah ulogovan; kad uključiš verifikaciju, vrati emailVerified: false + token + send email
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Auto-create primary event for the user
    const event = await this.prisma.event.create({
      data: {
        ownerId: user.id,
        title: "My Wedding",
        locale: "en",
        date: weddingDateParsed,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { primaryEventId: event.id },
    });

    // [VERIFICATION_OFF] ne šalje se email; vraćamo token da se odmah uloguje
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    // [VERIFICATION_ON] kad uključiš verifikaciju, zakomentariši return iznad i odkomentariši ispod:
    // const verificationToken = randomBytes(32).toString("hex");
    // const verificationExpires = new Date(Date.now() + 24 * 3600000);
    // (u create koristi emailVerified: false, emailVerificationToken, emailVerificationExpires)
    // const verifyUrl = this.getVerifyEmailUrl(verificationToken);
    // this.mail.sendVerificationEmail(user.email, verifyUrl).catch((err) => { ... });
    // return { message: "...", email: user.email };
  }

  private getVerifyEmailUrl(token: string): string {
    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${base}/auth/verify-email?token=${token}`;
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException("Invalid or expired verification link. You can request a new one from the sign-in page.");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      message: "Email verified. You can now sign in.",
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return { message: "If an account exists with this email, you will receive a new verification link." };
    }
    if (user.emailVerified) {
      return { message: "This account is already verified. You can sign in." };
    }
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 3600000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });
    const verifyUrl = this.getVerifyEmailUrl(token);
    const sent = await this.mail.sendVerificationEmail(user.email, verifyUrl);
    if (!sent) {
      throw new BadRequestException("We could not send the email. Please try again in a few minutes or contact support.");
    }
    return { message: "If an account exists with this email, you will receive a new verification link. Please check your spam folder too." };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }
    // [VERIFICATION_OFF] ne proveravamo emailVerified; kad uključiš verifikaciju, odkomentariši:
    // if (!user.emailVerified && user.emailVerificationToken != null) {
    //   throw new UnauthorizedException("EMAIL_NOT_VERIFIED");
    // }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Ensure user has a primary event (for existing users who registered before this feature)
    if (!user.primaryEventId) {
      const event = await this.prisma.event.create({
        data: {
          ownerId: user.id,
          title: "My Wedding",
          locale: "en",
        },
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { primaryEventId: event.id },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: tokens.accessToken, // Add 'token' alias for frontend compatibility
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const tokens = await this.generateTokens(user.id, user.email);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: tokens.accessToken, // Add 'token' alias for frontend compatibility
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
      expiresIn: parseInt(process.env.JWT_ACCESS_TTL || "900"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
      expiresIn: parseInt(process.env.JWT_REFRESH_TTL || "1209600"),
    });

    return { accessToken, refreshToken };
  }
}
