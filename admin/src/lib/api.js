import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marrakech-reviews-backend.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    const queryString = queryParams.toString();
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
  changePassword: (id, passwordData) => api.patch(`/users/${id}/password`, passwordData),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  bulkDeleteUsers: (ids) => api.delete('/users/bulk', { data: { ids } }),
  bulkUpdateUsers: (userIds, updateData) => api.post('/users/bulk-update', { userIds, updateData }),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkDeleteProducts: (ids) => api.delete('/products/bulk', { data: { ids } }),
  getTopProducts: (limit) => api.get(`/products/top?limit=${limit}`),
  getFeaturedProducts: (limit) => api.get(`/products/featured?limit=${limit}`),
  bulkImportProducts: (formData) => api.post('/bulk/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportProducts: (data) => api.post('/products/export', data, { responseType: 'blob' }),
};

export const productGeneratorAPI = {
  generateProduct: (product_url) => api.post('/generate-product', { product_url }),
  getProductGenerationStatus: (taskId) => api.get(`/product-status/${taskId}`),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  markAsDelivered: (id) => api.put(`/orders/${id}/deliver`),
  getOrderStats: () => api.get('/orders/stats'),
  sendPaymentReminder: (id) => api.post(`/orders/${id}/remind`),
  bulkDeleteOrders: (ids) => api.delete('/orders/bulk', { data: { ids } }),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  approveReview: (id, isApproved) => api.put(`/reviews/${id}/approve`, { isApproved }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  bulkDeleteReviews: (ids) => api.delete('/reviews/bulk', { data: { ids } }),
  bulkImportReviews: (data) => api.post('/reviews/bulk-import', data),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProductImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/product-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Articles API
export const articlesAPI = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticle: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles', data),
  updateArticle: (id, data) => api.put(`/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/articles/${id}`),
  bulkDeleteArticles: (ids) => api.delete('/articles/bulk', { data: { ids } }),
  generateAIArticles: (data) => api.post('/articles/generate-ai', data),
  bulkImportArticles: (formData) => api.post('/bulk/articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportArticles: (data) => api.post('/articles/export', data, { responseType: 'blob' }),
};

// Activities API
export const activitiesAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivity: (id) => api.get(`/activities/${id}`),
  createActivity: (data) => api.post('/activities', data),
  updateActivity: (id, data) => api.put(`/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/activities/${id}`),
  bulkDeleteActivities: (ids) => api.post('/activities/bulk-delete', { ids }),
  getActivityCategories: () => api.get('/activities/categories'),
  getReservations: (params) => api.get('/activities/reservations', { params }),
  createReservation: (data) => api.post('/activities/reservations', data),
  updateReservation: (id, data) => api.put(`/activities/reservations/${id}`, data),
  deleteReservation: (id) => api.delete(`/activities/reservations/${id}`),
  bulkImportActivities: (formData) => api.post('/bulk/activities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportActivities: (data) => api.post('/activities/export', data, { responseType: 'blob' }),
};

// Organized Travel API
export const organizedTravelAPI = {
  getAllTravelPrograms: (params) => api.get('/organized-travel/admin/programs', { params }),
  getTravelStats: () => api.get('/organized-travel/stats'),
  createProgram: (data) => api.post('/organized-travel/admin/programs', data),
  updateProgram: (id, data) => api.put(`/organized-travel/admin/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/organized-travel/admin/programs/${id}`),
  bulkDeletePrograms: (ids) => api.delete('/organized-travel/admin/programs/bulk', { data: { ids } }),
  getReservations: (params) => api.get('/organized-travel/admin/reservations', { params }),
  createReservation: (data) => api.post('/organized-travel/admin/reservations', data),
  updateReservation: (id, data) => api.put(`/organized-travel/admin/reservations/${id}`, data),
  deleteReservation: (id) => api.delete(`/organized-travel/admin/reservations/${id}`),
  bulkImportPrograms: (formData) => api.post('/bulk/organized-travels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportOrganizedTravels: (data) => api.post('/organized-travel/export', data, { responseType: 'blob' }),
  exportTravelReservations: (data) => api.post('/organized-travel/reservations/export', data, { responseType: 'blob' }),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (section, data) => api.put('/settings', { section, data }),
  updateSettingsSection: (section, data) => api.put(`/settings/${section}`, data),
  getSettingsSection: (section) => api.get(`/settings/${section}`),
  getPublicSettings: () => api.get('/settings/public'),
};

export default api;
