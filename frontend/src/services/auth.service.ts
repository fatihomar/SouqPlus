import axiosInstance from '../lib/axios';

export const authService = {
  register: async (data: any) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: any) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },
};
