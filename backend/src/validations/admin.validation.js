import { z } from 'zod';

export const updateListingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'PENDING_REVIEW', 'REJECTED', 'DELETED', 'REPORTED', 'SOLD', 'RENTED', 'EXPIRED'], { required_error: 'ERR_STATUS_REQUIRED', invalid_type_error: 'ERR_STATUS_INVALID' }),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

export const banUserSchema = z.object({
  body: z.object({
    reason: z.string({ required_error: 'ERR_REASON_REQUIRED' }).min(5, 'ERR_REASON_TOO_SHORT').max(500, 'ERR_REASON_TOO_LONG').optional(),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

