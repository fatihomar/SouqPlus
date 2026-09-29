import realEstateClient from './real-estate.client.js';
import RealEstateMapper from './real-estate.mapper.js';

class RealEstateService {
  async fetchAndMapListings(params = {}) {
    try {
      const response = await realEstateClient.getListings(params);
      const rawListings = response.data?.properties || [];
      
      const mappedListings = rawListings.map(item => RealEstateMapper.toExternalListing(item));
      return mappedListings;
    } catch (error) {
      console.error('RealEstateService Error:', error.message);
      throw error;
    }
  }
}

export default new RealEstateService();
