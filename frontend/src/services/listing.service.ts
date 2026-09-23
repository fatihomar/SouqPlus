import axiosInstance from '../lib/axios';

export const createListing = async (listingData: any) => {
  const response = await axiosInstance.post('/listings', listingData);
  return response.data;
};

export const updateListing = async (id: string, listingData: any) => {
  const response = await axiosInstance.put(`/listings/${id}`, listingData);
  return response.data;
};

export const getListings = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get('/listings', { params });
  return response.data;
};

export const getListingById = async (id: string) => {
  const response = await axiosInstance.get(`/listings/${id}`);
  return response.data;
};

export const getMyListings = async () => {
  const response = await axiosInstance.get('/listings/my-listings');
  return response.data;
};
export const deleteListing = async (id: string) => {
  const response = await axiosInstance.delete(`/listings/${id}`);
  return response.data;
};

export const getMyListingsStats = async () => {
  const response = await axiosInstance.get('/my-listings/stats');
  return response.data;
};

