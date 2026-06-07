import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});
export const getReviewsByProductId = (productId) =>
    api.get(`/reviews?productId=${productId}`);

export const createReview = (data) =>
    api.post('/reviews', data);

export const updateProduct = (id, data) =>
    api.patch(`/products/${id}`, data);

export default api;
