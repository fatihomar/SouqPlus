import axiosInstance from '../lib/axios';

export const messagesService = {
  getConversations: async () => {
    const response = await axiosInstance.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (userId: string) => {
    const response = await axiosInstance.get(`/messages/${userId}`);
    return response.data;
  },

  sendMessage: async (data: { receiverId: string, content?: string, imageUrl?: string, listingId?: string }) => {
    const response = await axiosInstance.post('/messages', data);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/messages/unread-count');
    return response.data;
  }
};
