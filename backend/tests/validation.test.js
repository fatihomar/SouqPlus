import { createListingSchema } from '../src/validations/listing.validation.js';
import { registerSchema } from '../src/validations/auth.validation.js';

describe('Input Validation Schemas & Error Codes', () => {

  it('should return ERR_PRICE_MUST_BE_POSITIVE when price is negative', () => {
    const payload = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description that is long enough',
        category: 'CAR',
        listingType: 'SALE',
        price: -500, // Invalid
        city: 'Dubai',
        district: 'Downtown',
        images: ['http://example.com/image.jpg'],
        carDetails: {
          brand: 'Toyota',
          model: 'Camry',
          year: 2020,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          condition: 'NEW'
        }
      }
    };

    const result = createListingSchema.safeParse(payload);
    expect(result.success).toBe(false);
    
    // Check if error array contains the correct error code
    const priceError = result.error.errors.find(e => e.path.includes('price'));
    expect(priceError.message).toBe('ERR_PRICE_MUST_BE_POSITIVE');
  });

  it('should return ERR_UNKNOWN_FIELDS_NOT_ALLOWED when extra fields are passed to strict schema', () => {
    const payload = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'BUYER',
        isAdmin: true // Malicious field
      }
    };

    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    
    const strictError = result.error.errors.find(e => e.message === 'ERR_UNKNOWN_FIELDS_NOT_ALLOWED');
    expect(strictError).toBeDefined();
  });

  it('should return ERR_YEAR_TOO_FAR for future car year', () => {
    const payload = {
      body: {
        title: 'Valid Title',
        description: 'Valid Description that is long enough',
        category: 'CAR',
        listingType: 'SALE',
        price: 50000,
        city: 'Dubai',
        district: 'Downtown',
        images: ['http://example.com/image.jpg'],
        carDetails: {
          brand: 'Toyota',
          model: 'Camry',
          year: 2050, // Invalid year
          fuelType: 'Petrol',
          transmission: 'Automatic',
          condition: 'NEW'
        }
      }
    };

    const result = createListingSchema.safeParse(payload);
    expect(result.success).toBe(false);
    
    const yearError = result.error.errors.find(e => e.path.includes('year'));
    expect(yearError.message).toBe('ERR_YEAR_TOO_FAR');
  });

});
