// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, LoginRequest, SignupRequest } from '@/api/services/auth';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          // In a real implementation, you would validate the token
          // and fetch user data
          setAuthState(prev => ({
            ...prev,
            token,
            // user: userData // would come from token validation
          }));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);
      
      // Save token securely
      await SecureStore.setItemAsync('authToken', response.token);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.signup(userData);
      
      // Save token securely
      await SecureStore.setItemAsync('authToken', response.token);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await SecureStore.deleteItemAsync('authToken');
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      await SecureStore.deleteItemAsync('authToken');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout,
  };
};

export default useAuth;