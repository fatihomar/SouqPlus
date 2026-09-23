import { z } from 'zod';

export const basicInfoSchema = z.object({
  title: z.string().min(5, 'ERR_TITLE_TOO_SHORT'),
  whatsappNumber: z.string().regex(/^\+?[0-9\s]+$/, 'ERR_INVALID_WHATSAPP').optional().or(z.literal('')),

  category: z.enum(['REAL_ESTATE', 'CAR'], {
    message: 'ERR_CATEGORY_REQUIRED',
  }),
  listingType: z.enum(['SALE', 'RENT'], {
    message: 'ERR_LISTING_TYPE_REQUIRED',
  }),
  price: z.number({
    message: 'ERR_PRICE_INVALID_TYPE',
  }).positive('ERR_PRICE_MUST_BE_POSITIVE'),
  rentPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  city: z.string().min(2, 'ERR_CITY_REQUIRED'),
  district: z.string().min(2, 'ERR_DISTRICT_REQUIRED'),
}).superRefine((data, ctx) => {
  if (data.listingType === 'RENT' && !data.rentPeriod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ERR_RENT_PERIOD_REQUIRED',
      path: ['rentPeriod'],
    });
  }
});

export const propertyDetailsSchema = z.object({
  propertyType: z.string().min(2, 'ERR_PROP_TYPE_REQUIRED'),
  area: z.number().positive('ERR_AREA_POSITIVE'),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor: z.number().optional(),
  yearBuilt: z.number().optional(),
  amenities: z.array(z.string()).optional(),
});

export const carDetailsSchema = z.object({
  brand: z.string().min(2, 'ERR_CAR_BRAND_REQUIRED'),
  model: z.string().min(1, 'ERR_CAR_MODEL_REQUIRED'),
  year: z.number().int().min(1900, 'ERR_YEAR_INVALID').max(new Date().getFullYear() + 1),
  mileage: z.number().nonnegative('ERR_MILEAGE_NEGATIVE'),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  condition: z.enum(['NEW', 'USED']),
});

// We don't validate actual File objects through Zod easily if they are stored in state outside Zod, 
// but we can create a schema for the array length.
export const imagesSchema = z.object({
  images: z.array(z.any())
    .min(1, 'ERR_IMAGES_REQUIRED')
    .max(20, 'ERR_TOO_MANY_IMAGES'),
});
