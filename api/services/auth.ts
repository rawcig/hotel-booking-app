// api/services/auth.ts
import apiClient from '../client';
import { ApiResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  token: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    // Save token in a real implementation
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    // Save token in a real implementation
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear token regardless of API response
    apiClient.setToken('');
  },

  // In a real app, you would also have:
  // refreshToken: () => Promise<AuthResponse>
  // forgotPassword: (email: string) => Promise<ApiResponse>
  // resetPassword: (token: string, password: string) => Promise<ApiResponse>
};