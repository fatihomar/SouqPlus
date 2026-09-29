import axiosInstance from '../lib/axios';

export const getExternalListings = async (filters: Record<string, string> = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const response = await axiosInstance.get(`/external-listings?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching external listings:', error);
    return { success: false, error: 'Failed to fetch external listings' };
  }
};

export const getExternalListingById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/external-listings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching external listing:', error);
    return { success: false, error: 'Failed to fetch external listing details' };
  }
};
