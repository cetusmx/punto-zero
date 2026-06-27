import api from '../lib/api';

export const getAdministrators = () => api.get('/admin/administrators');
export const getEligibleUsersForAdmin = (query = '') => api.get(`/admin/administrators/eligible-users?q=${encodeURIComponent(query)}`);
export const promoteToAdmin = (userId) => api.post(`/admin/administrators/${userId}/promote`);
export const demoteToVolunteer = (userId) => api.post(`/admin/administrators/${userId}/demote`);
export const toggleAdminBlock = (userId, action) => api.post(`/admin/administrators/${userId}/block`, { action });

export const getMetrics = () => api.get('/metrics');
export const getConfig = () => api.get('/config');
export const updateConfig = (payload) => api.put('/config', payload);
export const testSmsConfig = (payload) => api.post('/config/test-sms', payload);
