import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId: string;
    type: 'student';
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', data),

  register: (data: RegisterRequest): Promise<AxiosResponse<ApiResponse<{ student: any }>>> =>
    api.post('/auth/register/student', data),

  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),

  me: (): Promise<AxiosResponse<ApiResponse<{ user: any }>>> =>
    api.get('/auth/me'),

  refresh: (refreshToken: string): Promise<AxiosResponse<ApiResponse<{ tokens: any }>>> =>
    api.post('/auth/refresh', { refreshToken }),
};

// Student API
export const studentApi = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/students/profile'),

  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put('/students/profile', data),

  getCourses: (params?: { page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/students/courses', { params }),

  enrollInCourse: (courseId: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/students/courses/${courseId}/enroll`),

  getGPA: (): Promise<AxiosResponse<ApiResponse<{ gpa: number; scale: string }>>> =>
    api.get('/students/gpa'),
};

// Course API
export const courseApi = {
  search: (params: { q: string; page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/courses/search', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/courses/${id}`),

  getMaterials: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/courses/${id}/materials`),

  getProgress: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/courses/${id}/progress`),

  updateLessonProgress: (lessonId: string, completionPercentage: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/courses/lessons/${lessonId}/progress`, { completionPercentage }),
};

export default api;