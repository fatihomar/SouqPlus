import express from 'express';
const router = express.Router();
import adminController from '../controllers/admin.controller.js';
import authGuard from '../middlewares/auth.middleware.js';
import adminGuard from '../middlewares/admin.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updateListingStatusSchema, banUserSchema } from '../validations/admin.validation.js';
import { adminGeneralLimiter, adminSensitiveLimiter } from '../middlewares/rateLimit.middleware.js';

// حماية كل مسارات الإدارة
router.use(authGuard);
router.use(adminGuard);

// تطبيق Limit عام
router.use(adminGeneralLimiter);

// Dashboard Stats
router.get('/stats', adminController.getStats);

// Users Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminSensitiveLimiter, validate(banUserSchema), adminController.toggleUserBan);

// Listings Management
router.get('/listings', adminController.getListings);
router.put('/listings/:id/status', adminSensitiveLimiter, validate(updateListingStatusSchema), adminController.updateListingStatus);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Reports Management
router.get('/reports', adminController.getReports);
router.put('/reports/:id/status', adminSensitiveLimiter, adminController.updateReportStatus);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminSensitiveLimiter, adminController.updateSettings);

export default router;
