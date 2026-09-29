import carapisClient from './carapis.client.js';
import CarapisMapper from './carapis.mapper.js';

class CarapisService {
  async fetchAndMapListings(params = {}) {
    try {
      const response = await carapisClient.getListings(params);
      const rawListings = response.data?.listings || [];
      
      const mappedListings = rawListings.map(item => CarapisMapper.toExternalListing(item));
      return mappedListings;
    } catch (error) {
      console.error('CarapisService Error:', error.message);
      throw error;
    }
  }
}

export default new CarapisService();
