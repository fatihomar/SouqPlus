import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid({ message: 'معرف المستلم غير صحيح' }),
    listingId: z.string().uuid({ message: 'معرف الإعلان غير صحيح' }).optional().nullable(),
    imageUrl: z.string().url('ERR_IMAGE_URL_INVALID').optional().nullable(),
    content: z.string().min(1, { message: 'محتوى الرسالة مطلوب' }).max(1000, { message: 'الرسالة طويلة جداً' }),
  }).strict(),
});
