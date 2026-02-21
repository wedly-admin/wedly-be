import { z } from "zod";

export const SubmitGuestPhotosSchema = z.object({
  message: z.string().max(500).optional(),
});
export type SubmitGuestPhotosDto = z.infer<typeof SubmitGuestPhotosSchema>;
