import express from 'express';
import authController from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import authGuard from '../middlewares/auth.middleware.js';
import { loginLimiter, registerLimiter, forgotPasswordLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// مسار التسجيل (مع تطبيق شروط التحقق Zod وتقييد المحاولات)
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// مسار تسجيل الدخول
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// مسارات Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// مسار تسجيل الخروج
router.post('/logout', authGuard, authController.logout);

// مسارات استعادة كلمة المرور
import { forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation.js';
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);



// مسار جلب بيانات المستخدم الحالي (محمي بواسطة حارس الأمان Auth Guard)
router.get('/me', authGuard, authController.getMe);

export default router;
