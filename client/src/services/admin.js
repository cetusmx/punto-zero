import api from '../lib/api';

export const getAdministrators = () => api.get('/admin/administrators');
export const getEligibleUsersForAdmin = (query = '') => api.get(`/admin/administrators/eligible-users?q=${encodeURIComponent(query)}`);
export const promoteToAdmin = (userId) => api.post(`/admin/administrators/${userId}/promote`);
export const demoteToVolunteer = (userId) => api.post(`/admin/administrators/${userId}/demote`);
export const toggleAdminBlock = (userId, action) => api.post(`/admin/administrators/${userId}/block`, { action });
