import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Existing endpoints
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getBanners = () => api.get('/banners');
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const createVariant = (data) => api.post('/variants', data);
export const getProductBySlug = (slug) => api.get(`/products?slug=${slug}`);
export const getVariantsByProductId = (productId) => api.get(`/variants?productId=${productId}`);
export const getProductImages = (productId) => api.get(`/productImages?productId=${productId}`);
export const getProductSpecs = (productId) => api.get(`/productSpecifications?productId=${productId}`);
export const createProductSpec = (data) => api.post('/productSpecifications', data);
export const updateProductSpec = (id, data) => api.patch(`/productSpecifications/${id}`, data);
export const deleteProductSpec = (id) => api.delete(`/productSpecifications/${id}`);
export const getProductArticles = (productId) => api.get(`/productArticles?productId=${productId}`);
export const createProductArticle = (data) => api.post('/productArticles', data);
export const updateProductArticle = (id, data) => api.patch(`/productArticles/${id}`, data);
export const getVariantById = (variantId) => api.get(`/variants/${variantId}`);
export const getProductById = (productId) => api.get(`/products/${productId}`);

// Cart endpoints
export const getCart = (userId = 2) => api.get(`/carts?userId=${userId}`);
export const addToCart = (data) => api.post('/carts', data);
export const updateCartItem = (id, data) => api.patch(`/carts/${id}`, data);
export const deleteCartItem = (id) => api.delete(`/carts/${id}`);

// Address endpoints
export const getAddresses = (userId = 2) => api.get(`/addresses?userId=${userId}`);
export const updateAddress = (id, data) => api.patch(`/addresses/${id}`, data);

// Coupon endpoints
export const getCoupons = () => api.get('/coupons');
export const updateCoupon = (id, data) => api.patch(`/coupons/${id}`, data);

// Checkout & Order endpoints
export const createOrder = (data) => api.post('/orders', data);
export const createOrderItem = (data) => api.post('/orderItems', data);
export const getOrders = () => api.get('/orders');
export const getOrdersByUserId = (userId) => api.get(`/orders?userId=${userId}`);
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data);
export const getOrderItemsByOrderId = (orderId) => api.get(`/orderItems?orderId=${orderId}`);
export const getOrderItems = () => api.get('/orderItems');

// Payment endpoints
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.patch(`/payments/${id}`, data);

// Stock endpoints
export const createStockLog = (data) => api.post('/stockLogs', data);
export const updateVariant = (id, data) => api.patch(`/variants/${id}`, data);

// Order Status logs
export const createOrderStatusLog = (data) => api.post('/orderStatusLogs', data);

export default api;
