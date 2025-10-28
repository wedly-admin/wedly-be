import { z } from 'zod';
import { ItemStatusEnum } from '../common/schemas/enums';

const zDate = z.coerce.date();

export const ChecklistItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: ItemStatusEnum.default('TODO'),
  dueDate: zDate.optional(),
  assigneeId: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
});

export type ChecklistItemInput = z.infer<typeof ChecklistItemSchema>;

export const UpdateChecklistItemSchema = ChecklistItemSchema.partial();

