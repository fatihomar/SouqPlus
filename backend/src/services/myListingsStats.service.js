import prisma from '../config/prisma.js';

class MyListingsStatsService {
  async getStats(userId) {
    // 1. Fetch user's listings that are not deleted, along with counts of messages, offers, and favorites
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: userId,
        status: { not: 'DELETED' }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        images: true,
        category: true,
        price: true,
        status: true,
        views: true,
        _count: {
          select: {
            messages: true,
            offers: true,
            favorites: true
          }
        }
      }
    });

    // 2. Format individual listings
    const formattedListings = listings.map(l => ({
      id: l.id,
      title: l.title,
      thumbnail: l.images && l.images.length > 0 ? l.images[0] : null,
      category: l.category,
      price: l.price,
      status: l.status,
      views: l.views || 0,
      messagesCount: l._count?.messages || 0,
      offersCount: l._count?.offers || 0,
      favoritesCount: l._count?.favorites || 0
    }));

    // 3. If user has no listings, return 200 with zeros and empty list
    if (formattedListings.length === 0) {
      return {
        summary: {
          totalViews: 0,
          totalMessages: 0,
          totalOffers: 0,
          totalFavorites: 0,
          totalListings: 0,
          activeListings: 0,
          soldListings: 0,
          pendingListings: 0
        },
        listings: []
      };
    }

    // 4. Calculate summary aggregations
    const totalViews = formattedListings.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalMessages = formattedListings.reduce((sum, l) => sum + (l.messagesCount || 0), 0);
    const totalOffers = formattedListings.reduce((sum, l) => sum + (l.offersCount || 0), 0);
    const totalFavorites = formattedListings.reduce((sum, l) => sum + (l.favoritesCount || 0), 0);

    const totalListings = formattedListings.length;
    const activeListings = formattedListings.filter(l => l.status === 'ACTIVE').length;
    const soldListings = formattedListings.filter(l => l.status === 'SOLD' || l.status === 'RENTED').length;
    const pendingListings = formattedListings.filter(l => l.status === 'PENDING_REVIEW').length;

    return {
      summary: {
        totalViews,
        totalMessages,
        totalOffers,
        totalFavorites,
        totalListings,
        activeListings,
        soldListings,
        pendingListings
      },
      listings: formattedListings
    };
  }
}

export default new MyListingsStatsService();
