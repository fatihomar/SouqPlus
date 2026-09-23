import express from 'express';
import myListingsStatsController from '../controllers/myListingsStats.controller.js';
import authGuard from '../middlewares/auth.middleware.js';

const router = express.Router();

// Require authentication for stats
router.use(authGuard);

router.get('/stats', myListingsStatsController.getStats);

export default router;
