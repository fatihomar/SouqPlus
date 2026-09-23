import express from 'express';
import favoritesController from '../controllers/favorites.controller.js';
import authGuard from '../middlewares/auth.middleware.js';
import validateMiddleware from '../middlewares/validate.middleware.js';
import * as favoritesValidation from '../validations/favorites.validation.js';

const router = express.Router();

// All favorite routes require authentication
router.use(authGuard);

router.post(
  '/toggle',
  validateMiddleware(favoritesValidation.toggleFavoriteSchema),
  favoritesController.toggleFavorite
);

router.get('/', favoritesController.getFavorites);

export default router;
