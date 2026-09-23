import axiosInstance from '../lib/axios';

export const offersService = {
  createOffer: async (data: { listingId: string, amount: number }) => {
    const response = await axiosInstance.post('/offers', data);
    return response.data;
  },

  getMyOffers: async () => {
    const response = await axiosInstance.get('/offers/my-offers');
    return response.data;
  },

  getListingOffers: async (listingId: string) => {
    const response = await axiosInstance.get(`/offers/listing/${listingId}`);
    return response.data;
  },

  getReceivedOffers: async () => {
    const response = await axiosInstance.get('/offers/received-offers');
    return response.data;
  },

  respondToOffer: async (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    const response = await axiosInstance.put(`/offers/${offerId}/respond`, { action });
    return response.data;
  }
};
