import express from 'express';
import offersController from '../controllers/offers.controller.js';
import authGuard from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createOfferSchema, respondToOfferSchema } from '../validations/offers.validation.js';

const router = express.Router();

// جميع مسارات العروض تتطلب تسجيل دخول حتماً
router.use(authGuard);

// مسارات المشتري
router.post('/', validate(createOfferSchema), offersController.createOffer); // تقديم عرض جديد
router.get('/my-offers', offersController.getMyOffers); // جلب العروض التي قدمها المشتري نفسه

// مسارات البائع
router.get('/received-offers', offersController.getReceivedOffers); // جلب جميع العروض التي تلقاها البائع
router.get('/listing/:listingId', offersController.getListingOffers); // جلب جميع العروض المقدمة على إعلان معين يملكه
router.put('/:id/respond', validate(respondToOfferSchema), offersController.respondToOffer); // القبول أو الرفض على عرض

export default router;
