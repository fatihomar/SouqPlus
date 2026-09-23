import express from 'express';
import messagesController from '../controllers/messages.controller.js';
import authGuard from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createMessageSchema } from '../validations/messages.validation.js';
import rateLimit from 'express-rate-limit';

const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 messages per minute
  message: { success: false, error: 'لقد تجاوزت الحد المسموح لإرسال الرسائل (5 بالدقيقة). يرجى الانتظار.' },
  keyGenerator: (req, res) => req.user?.id || req.ip
});

const messageHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 messages per hour
  message: { success: false, error: 'لقد تجاوزت الحد المسموح لإرسال الرسائل (50 بالساعة). يرجى المحاولة لاحقاً.' },
  keyGenerator: (req, res) => req.user?.id || req.ip
});

const router = express.Router();

// All message routes require authentication
router.use(authGuard);

router.post('/', messageHourLimiter, messageRateLimiter, validate(createMessageSchema), messagesController.sendMessage);
router.get('/conversations', messagesController.getConversations);
router.get('/unread-count', messagesController.getUnreadCount);
router.get('/:userId', messagesController.getMessages);

export default router;
