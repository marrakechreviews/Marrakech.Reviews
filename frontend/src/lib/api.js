import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    
    const queryString = queryParams.toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },

  getFeaturedProducts: (limit = 8) => {
    return api.get(`/products/featured?limit=${limit}`);
  },

  getTopProducts: (limit = 8) => {
    return api.get(`/products/top?limit=${limit}`);
  },

  getProductsByCategory: (category, limit = 12) => {
    return api.get(`/products?category=${category}&limit=${limit}`);
  }
};

// Settings API (for public settings)
export const settingsAPI = {
  getPublicSettings: () => api.get('/settings/public'),
  getSettingsSection: (section) => api.get(`/settings/${section}`),
};

export default api;



// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  submitReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
};




// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

// Activities API
export const activitiesAPI = {
  getActivities: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/activities?${queryParams.toString()}`);
  },
  getActivityBySlug: (slug) => {
    return api.get(`/activities/${slug}`);
  },
  createReservation: (activityId, reservationData) => {
    return api.post(`/activities/${activityId}/reserve`, reservationData);
  },
};
