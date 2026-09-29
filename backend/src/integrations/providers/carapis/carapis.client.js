import axios from 'axios';

class CarapisClient {
  constructor() {
    this.baseURL = process.env.CARAPIS_BASE_URL || 'https://api.carapis.example.com';
    this.apiKey = process.env.CARAPIS_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getListings(params = {}) {
    if (!this.apiKey) {
      console.warn('CarapisClient: CARAPIS_API_KEY is not set. Returning empty data.');
      return { data: { listings: [] } };
    }
    
    try {
      const response = await this.client.get('/v1/cars', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching from Carapis:', error.message);
      throw error;
    }
  }
}

export default new CarapisClient();
