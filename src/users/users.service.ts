import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: any) {
    const raw = dto.weddingDate ?? dto.weddingDetails?.date;
    let weddingDateValue: Date | undefined;
    if (raw != null && String(raw).trim() !== "") {
      const s = String(raw).trim();
      if (s.includes("T") || /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) weddingDateValue = d;
      } else {
        const parts = s.split("-");
        if (parts.length === 3) {
          const mm = parseInt(parts[0], 10);
          const dd = parseInt(parts[1], 10);
          const yyyy = parseInt(parts[2], 10);
          if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && yyyy >= 1970) {
            weddingDateValue = new Date(yyyy, mm - 1, dd);
          }
        }
      }
    }

    const data: any = {};
    if (dto.groomFullName !== undefined) data.groomFullName = dto.groomFullName;
    if (dto.brideFullName !== undefined) data.brideFullName = dto.brideFullName;
    if (dto.weddingCountry !== undefined) data.weddingCountry = dto.weddingCountry;
    if (dto.weddingDetails?.country !== undefined) data.weddingCountry = dto.weddingDetails.country;
    if (dto.weddingCity !== undefined) data.weddingCity = dto.weddingCity;
    if (dto.weddingDetails?.city !== undefined) data.weddingCity = dto.weddingDetails.city;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.totalBudget !== undefined) data.totalBudget = dto.totalBudget;
    if (dto.defaultTableCapacity !== undefined) {
      const cap = Number(dto.defaultTableCapacity);
      data.defaultTableCapacity = Number.isInteger(cap) && cap >= 1 && cap <= 20 ? cap : 12;
    }
    if (weddingDateValue !== undefined) {
      data.weddingDate = weddingDateValue;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new UnauthorizedException("Invalid current password");
    }
    if (newPassword.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters");
    }
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: "Password updated successfully" };
  }
}
