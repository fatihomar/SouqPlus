import listingService from '../services/listing.service.js';

class ListingController {
  
  async createListing(req, res, next) {
    try {
      // Allow any authenticated user to create listings

      // حماية أمنية: sellerId يؤخذ حصراً من التوكن (req.user) وليس من البودي
      const sellerId = req.user.id;
      
      const listing = await listingService.createListing(sellerId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'تم إنشاء الإعلان بنجاح',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListings(req, res, next) {
    try {
      // استخراج الفلاتر من الرابط (Query Parameters)
      const { 
        page, limit, category, city, search, 
        district, minPrice, maxPrice, listingType,
        propertyType, minArea, maxArea, bedrooms, bathrooms,
        brand, model, condition, minYear, maxYear, fuelType, transmission,
        sortBy
      } = req.query;
      
      const result = await listingService.getListings({ 
        page, limit, category, city, search,
        district, minPrice, maxPrice, listingType,
        propertyType, minArea, maxArea, bedrooms, bathrooms,
        brand, model, condition, minYear, maxYear, fuelType, transmission,
        sortBy
      });
      
      res.status(200).json({
        success: true,
        data: result.listings,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyListings(req, res, next) {
    try {
      const sellerId = req.user.id;
      const listings = await listingService.getMyListings(sellerId);
      
      res.status(200).json({
        success: true,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req, res, next) {
    try {
      const viewerId = req.user?.id;
      const listing = await listingService.getListingById(req.params.id, viewerId);
      
      res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req, res, next) {
    try {
      const sellerId = req.user.id;
      const listingId = req.params.id;
      
      const listing = await listingService.updateListing(sellerId, listingId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'تم تحديث الإعلان بنجاح',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req, res, next) {
    try {
      const sellerId = req.user.id;
      const listingId = req.params.id;
      
      const result = await listingService.deleteListing(sellerId, listingId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ListingController();
