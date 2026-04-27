// src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// Interceptor untuk token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request:', config.method, config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor untuk debugging
api.interceptors.response.use(
    (response) => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// ============================================
// HOME DATA API
// ============================================
export const getHomeData = () => api.get('/home');

// ============================================
// AUTH API
// ============================================
export const loginAPI = (data) => api.post('/login', data);
export const registerAPI = (data) => api.post('/register', data);
export const logoutAPI = () => api.post('/logout');
export const getMe = () => api.get('/me');

// ============================================
// PRODUCT API
// ============================================
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);



// ============================================
// CATEGORY API
// ============================================
export const getCategories = () => api.get('/categories');

// COMBO API (Paket Hemat) - PASTIKAN INI ADA
// ============================================
export const getCombos = () => api.get('/combos');

// ============================================
// CART API (tambahan jika diperlukan)
// ============================================
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCart = (id, data) => api.put(`/cart/${id}`, data);
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
export const getCartCount = () => api.get('/cart/count');


// Tambahkan ini

export const submitComplaint = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/complaints`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getMyComplaints = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/complaints/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ========== ADMIN API ==========

export const getAllComplaints = (params = {}) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/admin/complaints`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getComplaintStats = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/admin/complaints/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getComplaintDetail = (id) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/admin/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateComplaintStatus = (id, status) => {
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/admin/complaints/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const respondComplaint = (id, response) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/admin/complaints/${id}/respond`, { admin_response: response }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteComplaint = (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/admin/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;