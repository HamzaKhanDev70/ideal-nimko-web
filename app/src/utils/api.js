// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ideal-nimko-web-production-e088.up.railway.app';

const getApiPath = (path) => path;

export const api = {
  // Products
  products: {
    getAll: () => `${API_BASE_URL}/api/products`,
    getById: (id) => `${API_BASE_URL}/api/products/${id}`,
    create: () => `${API_BASE_URL}/api/products`,
    update: (id) => `${API_BASE_URL}/api/products/${id}`,
    updateStock: (id) => `${API_BASE_URL}/api/products/${id}/stock`,
    delete: (id) => `${API_BASE_URL}/api/products/${id}`,
    uploadImages: () => `${API_BASE_URL}/api/products/upload-images`,
    uploadImage: () => `${API_BASE_URL}/api/products/upload-image`,
    categories: () => `${API_BASE_URL}/api/products/categories/list`
  },

  // Orders
  orders: {
    getAll: () => `${API_BASE_URL}/api/orders`,
    getById: (id) => `${API_BASE_URL}/api/orders/${id}`,
    create: () => `${API_BASE_URL}/api/orders`,
    update: (id) => `${API_BASE_URL}/api/orders/${id}`,
    updateStatus: (id) => `${API_BASE_URL}/api/orders/${id}/status`,
    delete: (id) => `${API_BASE_URL}/api/orders/${id}`,
    stats: () => `${API_BASE_URL}/api/orders/stats/dashboard`
  },

  // Shopkeeper Orders
  shopkeeperOrders: {
    getAll: () => `${API_BASE_URL}/api/shopkeeper-orders`,
    getById: (id) => `${API_BASE_URL}/api/shopkeeper-orders/${id}`,
    create: () => `${API_BASE_URL}/api/shopkeeper-orders`,
    updateStatus: (id) => `${API_BASE_URL}/api/shopkeeper-orders/${id}/status`,
    updatePayment: (id) => `${API_BASE_URL}/api/shopkeeper-orders/${id}/payment`,
    stats: () => `${API_BASE_URL}/api/shopkeeper-orders/stats/dashboard`
  },

  // Shopkeepers
  shopkeepers: {
    getAll: () => `${API_BASE_URL}/api/shopkeepers`
  },

  // Users
  users: {
    getAll: () => `${API_BASE_URL}/api/users`,
    getById: (id) => `${API_BASE_URL}/api/users/${id}`,
    create: () => `${API_BASE_URL}/api/users`,
    update: (id) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id) => `${API_BASE_URL}/api/users/${id}`,
    profile: () => `${API_BASE_URL}/api/users/profile`,
    login: () => `${API_BASE_URL}/api/users/login`
  },

  // Admin
  admin: {
    login: () => `${API_BASE_URL}${getApiPath('/api/admin/login')}`,
    profile: () => `${API_BASE_URL}${getApiPath('/api/admin/profile')}`
  },

  // Distribution
  distribution: {
    getAll: () => `${API_BASE_URL}/api/distribution`,
    create: () => `${API_BASE_URL}/api/distribution`,
    updateStatus: (id) => `${API_BASE_URL}/api/distribution/${id}/status`
  },

  // Sales
  sales: {
    getAll: () => `${API_BASE_URL}/api/sales`,
    create: () => `${API_BASE_URL}/api/sales`,
    stats: () => `${API_BASE_URL}/api/sales/stats/dashboard`
  },

  // Assignments
  assignments: {
    getAll: () => `${API_BASE_URL}${getApiPath('/api/assignments')}`,
    getBySalesman: (salesmanId) => `${API_BASE_URL}${getApiPath(`/api/assignments/salesman/${salesmanId}`)}`,
    getShopkeepersBySalesman: (salesmanId) => `${API_BASE_URL}${getApiPath(`/api/assignments/salesman/${salesmanId}/shopkeepers`)}`,
    create: () => `${API_BASE_URL}${getApiPath('/api/assignments')}`,
    update: (id) => `${API_BASE_URL}${getApiPath(`/api/assignments/${id}`)}`,
    delete: (id) => `${API_BASE_URL}${getApiPath(`/api/assignments/${id}`)}`,
    getAvailableSalesmen: () => `${API_BASE_URL}${getApiPath('/api/assignments/available/salesmen')}`,
    getAvailableShopkeepers: () => `${API_BASE_URL}${getApiPath('/api/assignments/available/shopkeepers')}`
  },

  // Categories
  categories: {
    getAll: () => `${API_BASE_URL}${getApiPath('/api/categories')}`,
    getAllForAdmin: () => `${API_BASE_URL}${getApiPath('/api/categories/all')}`,
    create: () => `${API_BASE_URL}${getApiPath('/api/categories')}`,
    update: (id) => `${API_BASE_URL}${getApiPath(`/api/categories/${id}`)}`,
    delete: (id) => `${API_BASE_URL}${getApiPath(`/api/categories/${id}`)}`,
    toggle: (id) => `${API_BASE_URL}${getApiPath(`/api/categories/${id}/toggle`)}`,
    reorder: () => `${API_BASE_URL}${getApiPath('/api/categories/reorder')}`
  },

  // Recoveries
  recoveries: {
    getAll: () => `${API_BASE_URL}${getApiPath('/api/recoveries')}`,
    getById: (id) => `${API_BASE_URL}${getApiPath(`/api/recoveries/${id}`)}`,
    create: () => `${API_BASE_URL}${getApiPath('/api/recoveries')}`,
    update: (id) => `${API_BASE_URL}${getApiPath(`/api/recoveries/${id}`)}`,
    delete: (id) => `${API_BASE_URL}${getApiPath(`/api/recoveries/${id}`)}`,
    getStats: () => `${API_BASE_URL}${getApiPath('/api/recoveries/stats/summary')}`,
    getShopkeepers: (salesmanId) => `${API_BASE_URL}${getApiPath(`/api/recoveries/shopkeepers/${salesmanId}`)}`
  },

  // Receipts
  receipts: {
    getAll: () => `${API_BASE_URL}/api/receipts`,
    getById: (id) => `${API_BASE_URL}/api/receipts/${id}`,
    create: () => `${API_BASE_URL}/api/receipts`,
    updateStatus: (id) => `${API_BASE_URL}/api/receipts/${id}/status`,
    getStats: () => `${API_BASE_URL}/api/receipts/stats/summary`
  },

  // Analytics
  analytics: {
    getDashboard: () => `${API_BASE_URL}${getApiPath('/api/analytics/dashboard')}`,
    getSalesmanAnalytics: (salesmanId) => `${API_BASE_URL}${getApiPath(`/api/analytics/salesman/${salesmanId}`)}`
  },

  // Notifications
  notifications: {
    getAll: () => `${API_BASE_URL}/api/notifications`,
    getById: (id) => `${API_BASE_URL}/api/notifications/${id}`,
    markAsRead: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
    markAllAsRead: () => `${API_BASE_URL}/api/notifications/read-all`,
    create: () => `${API_BASE_URL}/api/notifications`,
    delete: (id) => `${API_BASE_URL}/api/notifications/${id}`
  }
};
