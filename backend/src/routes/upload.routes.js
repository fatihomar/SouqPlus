import express from 'express';
const router = express.Router();
import uploadController from '../controllers/upload.controller.js';
import uploadMiddleware from '../middlewares/upload.middleware.js';
import authGuard from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

// تحديد معدل الطلبات: 100 صورة / يومياً
// سنضع حد 25 طلب للرفع كحد أقصى يومياً لكل مستخدم (حيث كل طلب يمكن أن يحتوي 20 صورة كحد أقصى)
const uploadRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
  max: 25, // 25 طلب كحد أقصى لكل IP أو مستخدم
  message: {
    success: false,
    error: 'ERR_UPLOAD_LIMIT_EXCEEDED'
  },
  keyGenerator: (req, res) => {
    return req.user ? req.user.id : req.ip;
  }
});

router.use(authGuard);

router.post('/', uploadRateLimiter, uploadMiddleware, uploadController.uploadImages);

export default router;
