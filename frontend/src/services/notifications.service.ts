import axiosInstance from '../lib/axios';

export const notificationsService = {
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  markSingleAsRead: async (id: string) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  },

  // Backward compatibility alias
  markAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  }
};
