import { z } from 'zod';

import { emailSchema } from '@/utils/validation';

export const emailFormSchema = z.object({
  email: emailSchema,
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;
