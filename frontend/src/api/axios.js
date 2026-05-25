import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novello_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('novello_token')
      localStorage.removeItem('novello_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ─── Books ─────────────────────────────────────────────────────────────────────
export const booksApi = {
  getAll: (page = 0, size = 12) => api.get(`/books?page=${page}&size=${size}`),
  getById: (id) => api.get(`/books/${id}`),
  search: (keyword, page = 0) => api.get(`/books/search?keyword=${keyword}&page=${page}`),
  getByCategory: (categoryId, page = 0) => api.get(`/books/category/${categoryId}?page=${page}`),
  getByType: (type, page = 0) => api.get(`/books/type/${type}?page=${page}`),
  getFeatured: () => api.get('/books/featured'),
  getTopRated: () => api.get('/books/top-rated'),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
}

// ─── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
}

// ─── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getAll: () => api.get('/orders/admin/all'),
}

// ─── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getByUser: (userId) => api.get(`/payments/user/${userId}`),
  getAll: () => api.get('/payments/admin/all'),
}

// ─── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  getByBook: (bookId) => api.get(`/inventory/${bookId}`),
  setStock: (bookId, quantity) => api.post(`/inventory/${bookId}/set`, { quantity }),
  addStock: (bookId, quantity) => api.post(`/inventory/${bookId}/add`, { quantity }),
  getAll: () => api.get('/inventory/admin/all'),
}

// ─── eBooks ────────────────────────────────────────────────────────────────────
export const ebooksApi = {
  upload: (bookId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/ebooks/upload/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  generateToken: (userId, bookId, orderId) =>
    api.post('/ebooks/token', { userId, bookId, orderId }),
  download: (token, userId) =>
    api.get(`/ebooks/download?token=${token}&userId=${userId}`, { responseType: 'blob' }),
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
}

// ─── Admin Users ───────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get('/users/admin/all'),
  toggleStatus: (id) => api.put(`/users/admin/${id}/toggle`),
  getProfile: () => api.get('/users/profile'),
}
