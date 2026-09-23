import express from 'express';
import notificationsController from '../controllers/notifications.controller.js';
import authGuard from '../middlewares/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(authGuard);

router.get('/unread-count', notificationsController.getUnreadCount);
router.get('/', notificationsController.getNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markSingleAsRead);

// Backward compatibility with previous frontend implementation
router.put('/read', notificationsController.markAllAsRead);

export default router;
