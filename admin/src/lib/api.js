import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const bypassMode = localStorage.getItem('bypassLogin');
    if (bypassMode === 'true') {
      // In bypass mode, add a mock token
      config.headers.Authorization = 'Bearer bypass-token';
    } else {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    const bypassMode = localStorage.getItem('bypassLogin');
    if (bypassMode === 'true') {
      // In bypass mode, don't redirect on 401 errors
      return Promise.reject(error);
    }
    
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
// export const usersAPI = {
  
//   createUser: (data) => api.get('/users', { data}),
//   getUsers: (params) => api.get('/users', { params }),
//   getUserById: (id) => api.get(`/users/${id}`),
//   updateUser: (id, data) => api.put(`/users/${id}`, data),
//   deleteUser: (id) => api.delete(`/users/${id}`),
//   getUserStats: () => api.get('/users/stats'),
// };


export const usersAPI = {
  // Get all users with optional filters
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

  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Create new user
  createUser: (data) => {
    return api.post('/users', data);
  },

  // Update user
  updateUser: (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  // Delete user
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },

  // Get user statistics
  getUserStats: () => {
    return api.get('/users/stats');
  },

  // Change user password
  changePassword: (id, passwordData) => {
    return api.patch(`/users/${id}/password`, passwordData);
  },

  // Toggle user status
  toggleUserStatus: (id) => {
    return api.patch(`/users/${id}/toggle-status`);
  },

  // Bulk operations
  bulkDeleteUsers: (userIds) => {
    return api.post('/users/bulk-delete', { userIds });
  },

  bulkUpdateUsers: (userIds, updateData) => {
    return api.post('/users/bulk-update', { userIds, updateData });
  }
};


// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getTopProducts: (limit) => api.get(`/products/top?limit=${limit}`),
  getFeaturedProducts: (limit) => api.get(`/products/featured?limit=${limit}`),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  markAsDelivered: (id) => api.put(`/orders/${id}/deliver`),
  getOrderStats: () => api.get('/orders/stats'),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  approveReview: (id, isApproved) => api.put(`/reviews/${id}/approve`, { isApproved }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadProductImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

