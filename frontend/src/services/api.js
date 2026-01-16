import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    }, { withCredentials: true });

                    const { access_token, refresh_token } = response.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    getMe: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh'),
};

// Products API
export const productsAPI = {
    list: (params) => api.get('/products', { params }),
    get: (slug) => api.get(`/products/${slug}`),
    search: (q) => api.get('/products/search', { params: { q } }),
    categories: () => api.get('/categories'),
    byCategory: (slug, params) => api.get(`/categories/${slug}`, { params }),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    getCount: () => api.get('/cart/count'),
    add: (productId, quantity) => api.post('/cart', { product_id: productId, quantity }),
    update: (id, quantity) => api.patch(`/cart/${id}`, { quantity }),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart'),
};

// Checkout API
export const checkoutAPI = {
    prepare: () => api.get('/checkout'),
    process: (data) => api.post('/checkout', data),
    uploadPayment: (orderId, formData) =>
        api.post(`/orders/${orderId}/payment`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// Orders API
export const ordersAPI = {
    list: (params) => api.get('/orders', { params }),
    get: (id) => api.get(`/orders/${id}`),
};

// Shipping API
export const shippingAPI = {
    searchDestinations: (q) => api.get('/shipping/destinations', { params: { q } }),
    calculateCost: (data) => api.post('/shipping/cost', data),
    getOptions: () => api.get('/shipping/options'),
    getStoreInfo: () => api.get('/shipping/store'),
};

// Banners API
export const bannersAPI = {
    list: () => api.get('/banners'),
};

// Profile API
export const profileAPI = {
    update: (data) => api.patch('/profile', data),
    updateAddress: (data) => api.patch('/profile/address', data),
};

// Admin API
export const adminAPI = {
    // Dashboard
    dashboard: () => api.get('/admin/dashboard'),

    // Subadmin Stats
    subadminStats: () => api.get('/admin/subadmin-stats'),

    // Products
    products: {
        list: (params) => api.get('/admin/products', { params }),
        create: (formData) => api.post('/admin/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        update: (id, formData) => api.put(`/admin/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        delete: (id) => api.delete(`/admin/products/${id}`),
        bulkPrice: (percentage) => api.post('/admin/products/bulk-price', { percentage }),
    },

    // Categories
    categories: {
        list: () => api.get('/admin/categories'),
        create: (data) => api.post('/admin/categories', data),
        update: (id, data) => api.put(`/admin/categories/${id}`, data),
        delete: (id) => api.delete(`/admin/categories/${id}`),
    },

    // Banners
    banners: {
        list: () => api.get('/admin/banners'),
        create: (formData) => api.post('/admin/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        delete: (id) => api.delete(`/admin/banners/${id}`),
        toggle: (id) => api.patch(`/admin/banners/${id}/toggle`),
    },

    // Orders
    orders: {
        list: (params) => api.get('/admin/orders', { params }),
        get: (id) => api.get(`/admin/orders/${id}`),
        updateStatus: (id, data) => api.patch(`/admin/orders/${id}`, data),
        verifyPayment: (orderId, proofId, data) =>
            api.post(`/admin/orders/${orderId}/verify-payment/${proofId}`, data),
        delete: (id) => api.delete(`/admin/orders/${id}`),
        getReceipt: (id) => api.get(`/admin/orders/${id}/receipt`),
    },
};

export default api;
