export const API_BASE_URL = "/api"

export const API_ENDPOINTS = {
  reviews: {
    list: `${API_BASE_URL}/reviews`,
    create: `${API_BASE_URL}/reviews`,
    import: `${API_BASE_URL}/reviews/admin/import`,
    sendRequest: `${API_BASE_URL}/reviews/admin/send-request`,
  },
  messages: {
    create: `${API_BASE_URL}/messages`,
    threads: `${API_BASE_URL}/messages/admin/threads`,
    thread: (threadId: number) => `${API_BASE_URL}/messages/thread/${threadId}`,
    reply: (threadId: number) => `${API_BASE_URL}/messages/thread/${threadId}/reply`,
    markMessageAsRead: (messageId: number) => `${API_BASE_URL}/messages/admin/${messageId}/read`,
    markThreadAsRead: (threadId: number) => `${API_BASE_URL}/messages/admin/thread/${threadId}/read`,
    deleteMessage: (messageId: number) => `${API_BASE_URL}/messages/admin/${messageId}`,
    deleteThread: (threadId: number) => `${API_BASE_URL}/messages/admin/thread/${threadId}`,
    statistics: `${API_BASE_URL}/messages/admin/statistics`,
  },
  blog: {
    list: `${API_BASE_URL}/blog`,
    slug: `${API_BASE_URL}/blog/slug`,
    create: (authorId: number) => `${API_BASE_URL}/blog/admin/${authorId}`,
    update: (postId: number) => `${API_BASE_URL}/blog/admin/blog/${postId}`,
    delete: (postId: number) => `${API_BASE_URL}/blog/admin/blog/${postId}`,
    upload: `${API_BASE_URL}/blog/admin/blog/upload`,
  },
  auth: {
    login: `${API_BASE_URL}/admin/auth/login`,
    logout: `${API_BASE_URL}/admin/auth/logout`,
    verify: `${API_BASE_URL}/admin/auth/verify`,
    register: `${API_BASE_URL}/admin/auth/register`,
    forgotPassword: `${API_BASE_URL}/admin/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/admin/auth/reset-password`,
    user: `${API_BASE_URL}/admin/auth/me`,
  },
} as const
