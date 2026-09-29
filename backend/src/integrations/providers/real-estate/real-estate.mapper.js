class RealEstateMapper {
  static toExternalListing(propertyItem) {
    return {
      externalId: String(propertyItem.id),
      source: 'REAL_ESTATE_PROVIDER',
      category: 'REAL_ESTATE',
      title: propertyItem.title || 'Property',
      description: propertyItem.description || null,
      price: propertyItem.price ? parseFloat(propertyItem.price) : null,
      currency: propertyItem.currency || 'USD',
      location: propertyItem.location ? {
        city: propertyItem.location.city,
        district: propertyItem.location.district,
      } : null,
      images: propertyItem.images || [],
      externalUrl: propertyItem.url || `https://realestate.example.com/listing/${propertyItem.id}`,
      rawData: propertyItem,
      isActive: true,
      lastSyncedAt: new Date(),
    };
  }
}

export default RealEstateMapper;
