import axiosInstance from '../lib/axios';

export const aiService = {
  analyzeImage: async (imageBase64: string, category: string, language: string = 'ar') => {
    const response = await axiosInstance.post('/ai/analyze-image', {
      image_base64: imageBase64,
      category,
      language
    });
    return response.data;
  },

  negotiateOffer: async (listing_price: number, offer_price: number, buyer_message?: string, language: string = 'ar') => {
    const response = await axiosInstance.post('/ai/negotiate', {
      listing_price,
      offer_price,
      buyer_message
    });
    return response.data;
  }
};
