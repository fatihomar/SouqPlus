class CarapisMapper {
  static toExternalListing(carapisItem) {
    return {
      externalId: String(carapisItem.id),
      source: 'CARAPIS',
      category: 'CAR',
      title: `${carapisItem.make} ${carapisItem.model} ${carapisItem.year}`,
      description: carapisItem.description || null,
      price: carapisItem.price ? parseFloat(carapisItem.price) : null,
      currency: carapisItem.currency || 'USD',
      location: carapisItem.location ? {
        city: carapisItem.location.city,
        district: carapisItem.location.district,
      } : null,
      images: carapisItem.photos || [],
      externalUrl: carapisItem.url || `https://carapis.example.com/listing/${carapisItem.id}`,
      rawData: carapisItem, // Store the raw data for fallback/debug
      isActive: true,
      lastSyncedAt: new Date(),
    };
  }
}

export default CarapisMapper;
