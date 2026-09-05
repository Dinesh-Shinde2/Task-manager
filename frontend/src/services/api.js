import axios from 'axios';

// Support VITE_API_BASE_URL for Vercel deployment, default to '/api' for local dev proxy
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (!url) return '/api';

  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to allow Render free tier instances to spin up from cold start
});

// Interceptor to add Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getUsers: (teamId) => api.get('/users', { params: { team_id: teamId } }),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
};

export const teamAPI = {
  getTeams: () => api.get('/teams'),
  createTeam: (teamData) => api.post('/teams', teamData),
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members/${userId}`),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  restoreTask: (id) => api.post(`/tasks/${id}/restore`),
};

export const commentAPI = {
  addComment: (taskId, comment) => api.post(`/tasks/${taskId}/comments`, { comment }),
};

export const attachmentAPI = {
  uploadAttachment: (taskId, formData) => api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDownloadUrl: (taskId, attachmentId) => `${API_BASE_URL}/tasks/${taskId}/attachments/${attachmentId}/download`
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const reportAPI = {
  getDashboardData: () => api.get('/reports/dashboard'),
  getAdminMetrics: () => api.get('/reports/admin-metrics'),
};

export default api;
