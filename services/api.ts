import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  clearAuthTokens 
} from '@/lib/storage';

// Define API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Define authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private refreshTokenPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      async (error) => {
        const originalRequest = error.config;

        // If token expired and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshToken();
            await this.setTokens(tokens);
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.clearTokens();
            // You might want to redirect to login screen here
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  private async getAccessToken(): Promise<string | null> {
    return await getAccessToken();
  }

  private async getRefreshToken(): Promise<string | null> {
    return await getRefreshToken();
  }

  public async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await setAccessToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  public async clearTokens(): Promise<void> {
    try {
      await clearAuthTokens();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Token refresh method
  private async refreshToken(): Promise<AuthTokens> {
    // If we're already refreshing, return the existing promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.axiosInstance
      .post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken })
      .then((response) => {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        throw new Error(response.data.error || 'Token refresh failed');
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  // Generic request methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  // Authentication endpoints
  public async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    return this.post<AuthTokens>('/auth/login', { email, password });
  }

  public async signup(userData: any): Promise<ApiResponse<AuthTokens>> {
    return this.post<AuthTokens>('/auth/signup', userData);
  }

  public async logout(): Promise<ApiResponse> {
    try {
      // Notify server of logout
      await this.post('/auth/logout');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }
  }

  // User endpoints
  public async getProfile(): Promise<ApiResponse<any>> {
    return this.get('/user/profile');
  }

  public async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.put('/user/profile', data);
  }

  // Hotel endpoints
  public async getHotels(params?: any): Promise<ApiResponse<any[]>> {
    return this.get('/hotels', { params });
  }

  public async getHotel(id: string): Promise<ApiResponse<any>> {
    return this.get(`/hotels/${id}`);
  }

  // Booking endpoints
  public async getBookings(): Promise<ApiResponse<any[]>> {
    return this.get('/bookings');
  }

  public async createBooking(data: any): Promise<ApiResponse<any>> {
    return this.post('/bookings', data);
  }

  public async cancelBooking(id: string): Promise<ApiResponse<any>> {
    return this.put(`/bookings/${id}/cancel`);
  }

  // Message endpoints
  public async getMessages(): Promise<ApiResponse<any[]>> {
    return this.get('/messages');
  }

  public async sendMessage(data: any): Promise<ApiResponse<any>> {
    return this.post('/messages', data);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;