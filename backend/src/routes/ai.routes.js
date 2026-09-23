import express from 'express';
import authGuard from '../middlewares/auth.middleware.js';
import validateMiddleware from '../middlewares/validate.middleware.js';
import aiController from '../controllers/ai.controller.js';
import * as aiValidation from '../validations/ai.validation.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();



/**
 * @route   POST /api/ai/analyze-image
 * @desc    Analyze image validity using AI
 * @access  Private (Seller only)
 */
router.post(
  '/analyze-image',
  authGuard,
  aiLimiter,
  validateMiddleware(aiValidation.analyzeImageSchema),
  aiController.analyzeImage
);

/**
 * @route   POST /api/ai/negotiate
 * @desc    Get AI negotiation advice for an offer
 * @access  Private (Seller only)
 */
router.post(
  '/negotiate',
  authGuard,
  aiLimiter,
  validateMiddleware(aiValidation.negotiateOfferSchema),
  aiController.negotiateOffer
);

export default router;
