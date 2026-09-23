import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  body: z.object({
    listingId: z.string().uuid({ message: 'معرف الإعلان غير صحيح (يجب أن يكون UUID)' })
  }).strict()
});
