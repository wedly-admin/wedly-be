import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: { email: string; password: string; name?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException("User with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
      },
    });

    // Auto-create primary event for the user
    const event = await this.prisma.event.create({
      data: {
        ownerId: user.id,
        title: "My Wedding",
        locale: "en",
      },
    });

    // Update user with primaryEventId
    await this.prisma.user.update({
      where: { id: user.id },
      data: { primaryEventId: event.id },
    });

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

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

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
