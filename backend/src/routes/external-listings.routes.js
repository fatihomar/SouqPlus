import express from 'express';
import { 
  getExternalListings, 
  getExternalListingById, 
  syncExternalListings 
} from '../controllers/external-listings.controller.js';
// NOTE: Ensure to import and use authentication/authorization middleware if needed.
// For sync, you should have admin middleware.
// import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getExternalListings);
router.get('/:id', getExternalListingById);

// Admin / protected route for manual syncing
// Assuming a structure where you might add protect/authorize later:
// router.post('/sync', protect, authorize('ADMIN'), syncExternalListings);
router.post('/sync', syncExternalListings); // Leaving unprotected for development/testing as requested

export default router;
