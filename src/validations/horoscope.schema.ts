import { z } from 'zod';

export const horoscopeSchema = z.object({
  rasi: z.string()
});
