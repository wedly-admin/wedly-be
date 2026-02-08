import { z } from 'zod';
import { GuestSideEnum, GuestStatusEnum } from '../common/schemas/enums';

export const GuestGroupSchema = z.object({
  label: z.string().min(1),
  notes: z.string().optional(),
});

export type GuestGroupInput = z.infer<typeof GuestGroupSchema>;

export const GuestSchema = z.object({
  groupId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  side: GuestSideEnum.default('OTHER'),
  status: GuestStatusEnum.default('PENDING'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  seatId: z.string().optional(),
});

export type GuestInput = z.infer<typeof GuestSchema>;

export const UpdateGuestSchema = GuestSchema.partial();

