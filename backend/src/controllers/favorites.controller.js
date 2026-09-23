import favoritesService from '../services/favorites.service.js';
import catchAsync from '../utils/catchAsync.js';

class FavoritesController {
  
  toggleFavorite = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء توفير معرف الإعلان'
      });
    }

    const result = await favoritesService.toggleFavorite(userId, listingId);

    res.status(200).json({
      success: true,
      message: result.isFavorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة',
      data: {
        listingId,
        isFavorite: result.isFavorite,
        added: result.added
      }
    });
  });

  getFavorites = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const favorites = await favoritesService.getFavorites(userId);
    
    res.status(200).json({
      success: true,
      data: favorites
    });
  });
}

export default new FavoritesController();
