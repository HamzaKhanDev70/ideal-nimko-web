// src/api/api.js
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://ideal-nimko-web-production-e088.up.railway.app/api";

export const getProducts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/products`, { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/products/categories/list`);
  return response.data;
};

export const placeOrder = async (order) => {
  const response = await axios.post(`${API_URL}/orders`, order);
  return response.data;
};

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};
