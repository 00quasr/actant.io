import { z } from "zod";

export const checkoutInputSchema = z.object({
  priceId: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
