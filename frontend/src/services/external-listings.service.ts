import { getAuthToken } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getExternalListings = async (filters: Record<string, string> = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/external-listings?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {})
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching external listings:', error);
    return { success: false, error: 'Failed to fetch external listings' };
  }
};

export const getExternalListingById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/external-listings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {})
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching external listing:', error);
    return { success: false, error: 'Failed to fetch external listing details' };
  }
};
