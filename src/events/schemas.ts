import { z } from 'zod';

const zDate = z.coerce.date();

export const CreateEventSchema = z.object({
  title: z.string().min(1),
  date: zDate.optional(),
  locale: z.enum(['sr', 'en']).default('sr'),
  sectionsI18n: z.record(z.enum(['sr', 'en']), z.any()).optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

