import axiosInstance from '../lib/axios';

export const uploadImages = async (images: File[]): Promise<string[]> => {
  if (!images || images.length === 0) return [];

  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await axiosInstance.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.urls;
};
