import { z } from 'zod';
import { CurrencyEnum, ItemStatusEnum } from '../common/schemas/enums';

const zDate = z.coerce.date();

export const BudgetSchema = z.object({
  currency: CurrencyEnum.default('RSD'),
  totalBudget: z.number().int().min(0).default(0),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

export const BudgetItemSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  planned: z.number().int().nonnegative().default(0),
  paid: z.number().int().nonnegative().default(0),
  vendorId: z.string().optional(),
  dueDate: zDate.optional(),
  status: ItemStatusEnum.default('TODO'),
  notes: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
});

export type BudgetItemInput = z.infer<typeof BudgetItemSchema>;

export const UpdateBudgetItemSchema = BudgetItemSchema.partial();

