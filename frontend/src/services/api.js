import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create base axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to build query string from parameters
const buildQueryString = (params) => {
  if (!params) return '';
  
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Export specific API instances
export const inventoryAPI = {
  // Get products with optional filtering and sorting
  getProducts: (params = {}) => {
    const queryString = buildQueryString(params);
    return api.get(`/products${queryString}`);
  },
  
  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Export products
  exportProducts: (format = 'csv') => {
    return api.get(`/products/export?format=${format}`, {
      responseType: 'blob' // Important for file downloads
    });
  },
  
  // Import products
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};

// Add productsAPI for backward compatibility - ADD THIS SECTION
export const productsAPI = {
  // Get products with optional filtering and sorting
  getProducts: (params = {}) => {
    const queryString = buildQueryString(params);
    return api.get(`/products${queryString}`);
  },
  
  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Export products
  exportProducts: (format = 'csv') => {
    return api.get(`/products/export?format=${format}`, {
      responseType: 'blob'
    });
  },
  
  // Import products
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};

// Transactions API
export const transactionsAPI = {
  // Get transactions with optional filtering
  getTransactions: (params = {}) => {
    const queryString = buildQueryString(params);
    return api.get(`/transactions${queryString}`);
  },
  
  // Create new transaction
  createTransaction: (data) => api.post('/transactions', data),
  
  // Get transaction statistics
  getTransactionStats: () => api.get('/transactions/stats'),
  
  // Export transactions
  exportTransactions: (format = 'csv') => {
    return api.get(`/transactions/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

export default api;