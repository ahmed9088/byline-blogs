import axios from 'axios';

// Dynamically resolve relative /api endpoint in browser so API calls work seamlessly on any domain or Vercel preview URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api/backend';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Clearing local session.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: any) => api.put('/auth/me', data),
  getUsers: () => api.get('/users'),
  getUserProfile: (id: string) => api.get(`/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getBookmarks: () => api.get('/auth/bookmarks'),
  toggleFollow: (id: string) => api.post(`/auth/users/${id}/follow`),
  getFollowerFeed: (page?: number) => api.get('/auth/feed', { params: { page } }),
  searchUsers: (query: string) => api.get('/auth/search-users', { params: { q: query } }),
  getNotifications: () => api.get('/auth/notifications'),
  markNotificationsRead: () => api.put('/auth/notifications/read')
};

export const postsAPI = {
  getPosts: (params?: any) => api.get('/posts', { params }),
  getPostBySlug: (slug: string) => api.get(`/posts/${slug}`),
  createPost: (data: any) => api.post('/posts', data),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  bookmarkPost: (postId: string) => api.post(`/posts/${postId}/bookmark`),
  likePost: (id: string, isLiked: boolean) => api.post(`/posts/${id}/like`, { isLiked })
};

export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`)
};

export const tagsAPI = {
  getTags: () => api.get('/tags'),
  createTag: (data: any) => api.post('/tags', data),
  updateTag: (id: string, data: any) => api.put(`/tags/${id}`, data),
  deleteTag: (id: string) => api.delete(`/tags/${id}`)
};

export const commentsAPI = {
  getCommentsByPost: (postId: string) => api.get(`/comments/post/${postId}`),
  getCommentsForPost: (postId: string) => api.get(`/comments/post/${postId}`),
  createComment: (data: any) => api.post('/comments', data),
  getAllComments: (status?: string) => api.get('/comments', { params: { status } }),
  updateCommentStatus: (id: string, status: string) => api.put(`/comments/${id}/status`, { status }),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  likeComment: (id: string) => api.post(`/comments/${id}/like`)
};

export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data)
};

export const newsletterAPI = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email: string) => api.post('/newsletter/unsubscribe', { email }),
  getSubscribers: () => api.get('/newsletter/subscribers'),
  sendNewsletter: (subject: string, body: string) => api.post('/newsletter/send', { subject, body })
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getDashboardAnalytics: () => api.get('/analytics/overview')
};

export const auditLogAPI = {
  getLogs: (params?: any) => api.get('/audit-log', { params }),
  getAuditLogs: (params?: any) => api.get('/audit-log', { params })
};

export const mediaAPI = {
  getMedia: () => api.get('/media'),
  getMediaAssets: () => api.get('/media'),
  upload: (formData: any) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMediaAsset: (formData: any) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage: (formData: any) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/media/${id}`),
  deleteMediaAsset: (id: string) => api.delete(`/media/${id}`)
};

export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserProfile: (id: string) => api.get(`/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  searchUsers: (query: string) => api.get('/auth/search-users', { params: { q: query } })
};

export default api;
