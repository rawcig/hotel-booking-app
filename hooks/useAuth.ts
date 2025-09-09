// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, LoginRequest, SignupRequest } from '@/api/services/auth';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
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
    isLoading: true, // Start with loading true
    error: null,
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response) {
          setAuthState({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          // User is logged in
          setAuthState(prev => ({
            ...prev,
            user: {
              id: session.user.id,
              name: session.user.email || '', // Will be updated with profile data
              email: session.user.email || '',
              phone: null,
              role: 'user',
            },
            token: session.access_token || null,
            isLoading: false,
          }));
        } else {
          // User is logged out
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
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
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
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
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Logout failed',
      }));
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