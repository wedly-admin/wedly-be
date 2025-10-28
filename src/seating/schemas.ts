import { z } from 'zod';
import { GuestSideEnum } from '../common/schemas/enums';

export const TableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive().default(8),
  side: GuestSideEnum.optional(),
  order: z.number().int().nonnegative().default(0),
});

export type TableInput = z.infer<typeof TableSchema>;

export const UpdateTableSchema = TableSchema.partial();

export const SeatAssignmentSchema = z.object({
  tableId: z.string().min(1),
  guestId: z.string().min(1),
  position: z.number().int().nonnegative().default(0),
});

export type SeatAssignmentInput = z.infer<typeof SeatAssignmentSchema>;

export const UpdateSeatAssignmentSchema = SeatAssignmentSchema.partial();

