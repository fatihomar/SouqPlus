import axiosInstance from '../lib/axios';

export const getAdminStats = async () => {
  const response = await axiosInstance.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async (page = 1, limit = 20, search?: string, role?: string, banned?: boolean) => {
  const response = await axiosInstance.get('/admin/users', { params: { page, limit, search, role, banned } });
  return response.data;
};

export const toggleUserBan = async (userId: string) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/ban`, {});
  return response.data;
};

export const getAdminListings = async (page = 1, limit = 20, status?: string, search?: string, category?: string) => {
  const response = await axiosInstance.get('/admin/listings', { params: { page, limit, status, search, category } });
  return response.data;
};

export const updateListingStatus = async (listingId: string, status: string) => {
  const response = await axiosInstance.put(`/admin/listings/${listingId}/status`, { status });
  return response.data;
};

export const getAuditLogs = async (page = 1, limit = 20, action?: string, adminId?: string) => {
  const response = await axiosInstance.get('/admin/audit-logs', { params: { page, limit, action, adminId } });
  return response.data;
};

export const getReports = async (page = 1, limit = 20, status?: string) => {
  const response = await axiosInstance.get('/admin/reports', { params: { page, limit, status } });
  return response.data;
};

export const updateReportStatus = async (reportId: string, status: string) => {
  const response = await axiosInstance.put(`/admin/reports/${reportId}/status`, { status });
  return response.data;
};

export const getSettings = async () => {
  const response = await axiosInstance.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (settings: any) => {
  const response = await axiosInstance.put('/admin/settings', settings);
  return response.data;
};
