import express from 'express';
const router = express.Router();
import listingController from '../controllers/listing.controller.js';
import validate from '../middlewares/validate.middleware.js';
import authGuard from '../middlewares/auth.middleware.js';
import { createListingSchema, updateListingSchema } from '../validations/listing.validation.js';

import optionalAuth from '../middlewares/optionalAuth.middleware.js';
import myListingsStatsController from '../controllers/myListingsStats.controller.js';

// مسارات متاحة للجميع (عامة)
router.get('/', listingController.getListings);

// مسارات إعلاناتي يجب أن تكون قبل مسار الـ ID لتجنب التضارب
router.get('/my-listings/stats', authGuard, myListingsStatsController.getStats);
router.get('/my-listings', authGuard, listingController.getMyListings);

// مسار جلب إعلان محدد (متاح للجميع مع تتبع المشاهدات للمستخدم غير المالك)
router.get('/:id', optionalAuth, listingController.getListingById);

// مسارات محمية (تحتاج تسجيل دخول كبائع أو مشتري)
router.use(authGuard);

router.post('/', validate(createListingSchema), listingController.createListing);
router.put('/:id', validate(updateListingSchema), listingController.updateListing);
router.delete('/:id', listingController.deleteListing);

export default router;
