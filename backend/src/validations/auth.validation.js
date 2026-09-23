import { z } from 'zod';

// شروط فحص بيانات التسجيل (بما فيها السماح بتحديد الـ Role كما طلب كلاود)
export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'ERR_EMAIL_REQUIRED' }).email('ERR_EMAIL_INVALID'),
    password: z.string({ required_error: 'ERR_PASSWORD_REQUIRED' }).min(6, 'ERR_PASSWORD_TOO_SHORT').max(100, 'ERR_PASSWORD_TOO_LONG'),
    fullName: z.string({ required_error: 'ERR_FULLNAME_REQUIRED' }).min(2, 'ERR_FULLNAME_TOO_SHORT').max(100, 'ERR_FULLNAME_TOO_LONG'),
    role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

// شروط فحص بيانات تسجيل الدخول
export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'ERR_EMAIL_REQUIRED' }).email('ERR_EMAIL_INVALID'),
    password: z.string({ required_error: 'ERR_PASSWORD_REQUIRED' }).min(1, 'ERR_PASSWORD_REQUIRED'),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

// شروط فحص استعادة كلمة المرور
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'ERR_EMAIL_REQUIRED' }).email('ERR_EMAIL_INVALID'),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'ERR_EMAIL_REQUIRED' }).email('ERR_EMAIL_INVALID'),
    code: z.string({ required_error: 'ERR_CODE_REQUIRED' }).length(6, 'ERR_CODE_INVALID').regex(/^\d+$/, 'ERR_CODE_NUMBERS_ONLY'),
    newPassword: z.string({ required_error: 'ERR_PASSWORD_REQUIRED' }).min(6, 'ERR_PASSWORD_TOO_SHORT').max(100, 'ERR_PASSWORD_TOO_LONG'),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

