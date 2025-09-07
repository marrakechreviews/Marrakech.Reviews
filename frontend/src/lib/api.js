import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://marrakech-reviews-backend.vercel.app/api').replace(/\/$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

  getProductBySlug: (slug) => {
    return api.get(`/products/slug/${slug}`);
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
  getReviews: ({ refId, refModel, ...params }) => {
    const queryParams = new URLSearchParams({ refId, refModel, ...params });
    return api.get(`/reviews?${queryParams.toString()}`);
  },
  submitReview: (reviewData) => api.post('/reviews', reviewData),
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

// Articles API
export const articlesAPI = {
  getArticles: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/articles?${queryParams.toString()}`);
  },
  getArticleBySlug: (slug) => {
    return api.get(`/articles/slug/${slug}`);
  },
};

// Organized Travel API
export const organizedTravelAPI = {
  getTravelProgramByDestination: (destination) => {
    return api.get(`/organized-travel/${destination}`);
  },
  createReservation: (reservationData) => {
    return api.post('/organized-travel/reservations', reservationData);
  },
};

// Orders API
export const ordersAPI = {
  getOrder: (id) => api.get(`/orders/${id}`),
  getOrderByToken: (token) => api.get(`/orders/payment/${token}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  payOrder: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
  getMyOrders: () => api.get('/orders/myorders'),
};
