import prisma from '../config/prisma.js';

class FavoritesService {
  async toggleFavorite(userId, listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      const error = new Error('الإعلان غير موجود');
      error.statusCode = 404;
      throw error;
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId }
      }
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return { added: false, isFavorite: false };
    } else {
      if (listing.sellerId === userId) {
        const error = new Error('لا يمكنك إضافة إعلانك الخاص إلى المفضلة');
        error.statusCode = 400;
        throw error;
      }

      try {
        await prisma.favorite.create({
          data: { userId, listingId }
        });
        return { added: true, isFavorite: true };
      } catch (err) {
        if (err.code === 'P2002') {
          // It was already added by a race condition
          return { added: true, isFavorite: true };
        }
        throw err;
      }
    }
  }

  async getFavorites(userId) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to return listings with isFavorite flag to make it easier for frontend
    return favorites.map(f => ({ ...f.listing, isFavorite: true, favoriteId: f.id }));
  }
}

export default new FavoritesService();
