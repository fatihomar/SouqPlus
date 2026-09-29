import prisma from '../config/prisma.js';
import carapisService from '../integrations/providers/carapis/carapis.service.js';
import realEstateService from '../integrations/providers/real-estate/real-estate.service.js';

class ExternalSyncService {
  async syncListings(providerName, params = {}) {
    console.log(`Starting sync for provider: ${providerName}`);
    let externalListings = [];

    // Fetch and map listings based on provider
    try {
      if (providerName === 'CARAPIS') {
        externalListings = await carapisService.fetchAndMapListings(params);
      } else if (providerName === 'REAL_ESTATE_PROVIDER') {
        externalListings = await realEstateService.fetchAndMapListings(params);
      } else {
        throw new Error(`Unknown provider: ${providerName}`);
      }
    } catch (error) {
      console.error(`Failed to fetch from ${providerName}:`, error.message);
      throw error;
    }

    if (!externalListings.length) {
      console.log(`No listings found from ${providerName} to sync.`);
      return { success: true, message: 'No new listings to sync.', count: 0 };
    }

    let syncedCount = 0;
    const currentSyncTime = new Date();

    // Upsert each listing
    for (const listing of externalListings) {
      try {
        await prisma.externalListing.upsert({
          where: {
            source_externalId: {
              source: listing.source,
              externalId: listing.externalId,
            },
          },
          update: {
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency,
            location: listing.location,
            images: listing.images,
            externalUrl: listing.externalUrl,
            rawData: listing.rawData,
            isActive: true,
            lastSyncedAt: currentSyncTime,
          },
          create: {
            ...listing,
            lastSyncedAt: currentSyncTime,
          },
        });
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync listing ${listing.externalId} from ${providerName}:`, error.message);
      }
    }

    // Optional: Mark older listings from this source as inactive if they weren't synced just now
    // (We'll only do this if we are confident we fetched ALL listings, which might not be true if using pagination)
    
    console.log(`Successfully synced ${syncedCount} listings from ${providerName}`);
    return { success: true, count: syncedCount, source: providerName };
  }
}

export default new ExternalSyncService();
