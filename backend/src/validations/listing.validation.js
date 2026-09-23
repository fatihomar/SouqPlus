import { z } from 'zod';

// إنشاء الإعلان (Create Listing)
export const createListingSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'ERR_TITLE_REQUIRED' }).min(5, 'ERR_TITLE_TOO_SHORT').max(100, 'ERR_TITLE_TOO_LONG'),
    description: z.string().optional(),
    whatsappNumber: z.string().regex(/^\+?[0-9\s]+$/, 'ERR_INVALID_WHATSAPP').optional(),
    category: z.enum(['REAL_ESTATE', 'CAR'], { required_error: 'ERR_CATEGORY_REQUIRED', invalid_type_error: 'ERR_CATEGORY_INVALID' }),
    listingType: z.enum(['SALE', 'RENT'], { required_error: 'ERR_LISTING_TYPE_REQUIRED', invalid_type_error: 'ERR_LISTING_TYPE_INVALID' }),
    price: z.coerce.number({ required_error: 'ERR_PRICE_REQUIRED', invalid_type_error: 'ERR_PRICE_INVALID_TYPE' })
      .positive('ERR_PRICE_MUST_BE_POSITIVE')
      .max(1000000000, 'ERR_PRICE_TOO_LARGE')
      .refine((val) => !isNaN(val) && isFinite(val), { message: 'ERR_PRICE_INVALID' }),
    rentPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    city: z.string({ required_error: 'ERR_CITY_REQUIRED' }).min(2, 'ERR_CITY_TOO_SHORT').max(50, 'ERR_CITY_TOO_LONG'),
    district: z.string({ required_error: 'ERR_DISTRICT_REQUIRED' }).min(2, 'ERR_DISTRICT_TOO_SHORT').max(50, 'ERR_DISTRICT_TOO_LONG'),
    images: z.array(z.string().url('ERR_IMAGE_URL_INVALID')).min(1, 'ERR_IMAGES_REQUIRED').max(10, 'ERR_TOO_MANY_IMAGES'),
    
    propertyDetails: z.object({
      propertyType: z.string({ required_error: 'ERR_PROP_TYPE_REQUIRED' }),
      area: z.coerce.number().positive('ERR_AREA_POSITIVE').max(100000, 'ERR_AREA_TOO_LARGE'),
      bedrooms: z.coerce.number().min(0, 'ERR_BEDROOMS_INVALID').max(50, 'ERR_BEDROOMS_TOO_LARGE').optional(),
      bathrooms: z.coerce.number().min(0, 'ERR_BATHROOMS_INVALID').max(50, 'ERR_BATHROOMS_TOO_LARGE').optional(),
      floor: z.coerce.number().optional(),
      yearBuilt: z.coerce.number().min(1900, 'ERR_YEAR_TOO_OLD').max(new Date().getFullYear() + 5, 'ERR_YEAR_TOO_FAR').optional(),
      amenities: z.array(z.string()).optional(),
    }).strict().optional(),

    carDetails: z.object({
      brand: z.string({ required_error: 'ERR_CAR_BRAND_REQUIRED' }),
      model: z.string({ required_error: 'ERR_CAR_MODEL_REQUIRED' }),
      year: z.coerce.number().min(1900, 'ERR_YEAR_TOO_OLD').max(new Date().getFullYear() + 2, 'ERR_YEAR_TOO_FAR'),
      mileage: z.coerce.number().min(0, 'ERR_MILEAGE_NEGATIVE').max(2000000, 'ERR_MILEAGE_TOO_LARGE').optional(),
      fuelType: z.string({ required_error: 'ERR_FUEL_TYPE_REQUIRED' }),
      transmission: z.string({ required_error: 'ERR_TRANSMISSION_REQUIRED' }),
      condition: z.string({ required_error: 'ERR_CONDITION_REQUIRED' }),
    }).strict().optional(),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED').superRefine((data, ctx) => {
    // 1. Conditional Validation: RENT -> rentPeriod
    if (data.listingType === 'RENT' && !data.rentPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ERR_RENT_PERIOD_REQUIRED',
        path: ['rentPeriod'],
      });
    }

    // 2. Conditional Validation: Category Details
    if (data.category === 'REAL_ESTATE' && !data.propertyDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ERR_PROPERTY_DETAILS_REQUIRED',
        path: ['propertyDetails'],
      });
    }
    if (data.category === 'CAR' && !data.carDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ERR_CAR_DETAILS_REQUIRED',
        path: ['carDetails'],
      });
    }
  }),
});

// تحديث الإعلان (Update Listing)
export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'ERR_TITLE_TOO_SHORT').max(100, 'ERR_TITLE_TOO_LONG').optional(),
    description: z.string().optional(),
    whatsappNumber: z.string().regex(/^\+?[0-9\s]+$/, 'ERR_INVALID_WHATSAPP').optional(),
    price: z.coerce.number().positive('ERR_PRICE_MUST_BE_POSITIVE').max(1000000000, 'ERR_PRICE_TOO_LARGE')
      .refine((val) => !isNaN(val) && isFinite(val), { message: 'ERR_PRICE_INVALID' }).optional(),
    images: z.array(z.string().url('ERR_IMAGE_URL_INVALID')).max(10, 'ERR_TOO_MANY_IMAGES').optional(),
    rentPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    
    // Notice: status, views, sellerId, category, listingType are NOT allowed here.
    
    propertyDetails: z.object({
      propertyType: z.string().optional(),
      area: z.coerce.number().positive('ERR_AREA_POSITIVE').max(100000, 'ERR_AREA_TOO_LARGE').optional(),
      bedrooms: z.coerce.number().min(0, 'ERR_BEDROOMS_INVALID').max(50, 'ERR_BEDROOMS_TOO_LARGE').optional(),
      bathrooms: z.coerce.number().min(0, 'ERR_BATHROOMS_INVALID').max(50, 'ERR_BATHROOMS_TOO_LARGE').optional(),
      floor: z.coerce.number().optional(),
      yearBuilt: z.coerce.number().min(1900, 'ERR_YEAR_TOO_OLD').max(new Date().getFullYear() + 5, 'ERR_YEAR_TOO_FAR').optional(),
      amenities: z.array(z.string()).optional(),
    }).strict().optional(),

    carDetails: z.object({
      brand: z.string().optional(),
      model: z.string().optional(),
      year: z.coerce.number().min(1900, 'ERR_YEAR_TOO_OLD').max(new Date().getFullYear() + 2, 'ERR_YEAR_TOO_FAR').optional(),
      mileage: z.coerce.number().min(0, 'ERR_MILEAGE_NEGATIVE').max(2000000, 'ERR_MILEAGE_TOO_LARGE').optional(),
      fuelType: z.string().optional(),
      transmission: z.string().optional(),
      condition: z.string().optional(),
    }).strict().optional(),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

