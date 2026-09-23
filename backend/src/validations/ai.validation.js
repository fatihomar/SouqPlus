import { z } from 'zod';



export const analyzeImageSchema = z.object({
  body: z.object({
    image_base64: z.string().min(1),
    category: z.enum(['REAL_ESTATE', 'CAR']),
    language: z.enum(['ar', 'en']).optional(),
  }).strict()
});

export const negotiateOfferSchema = z.object({
  body: z.object({
    listing_price: z.number().positive(),
    offer_price: z.number().positive(),
    buyer_message: z.string().min(1).max(1000),
    language: z.enum(['ar', 'en']).optional(),
  }).strict()
});

