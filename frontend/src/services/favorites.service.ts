import axiosInstance from '../lib/axios';

export const favoritesService = {
  getFavorites: async () => {
    const response = await axiosInstance.get('/favorites');
    return response.data;
  },

  toggleFavorite: async (listingId: string) => {
    const response = await axiosInstance.post('/favorites/toggle', { listingId });
    return response.data;
  }
};
