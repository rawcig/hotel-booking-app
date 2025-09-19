// context/UserContext.tsx
import { authService } from '@/api/services/auth';
import { supabase } from '@/lib/supabase';
import { analyticsService } from '@/services/analyticsService';
import { Session } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  createGuestSession: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createGuestSession = async () => {
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const guestUser: User = {
      id: guestId,
      email: 'guest@example.com',
      name: 'Guest User'
    };
    setUser(guestUser);
    setSession(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (result) {
          setUser({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone,
          });
          setSession({
            access_token: result.token,
            user: {
              id: result.user.id,
              email: result.user.email,
              user_metadata: {
                name: result.user.name,
                phone: result.user.phone,
              }
            }
          } as Session);
        } else {
          // Create guest session
          const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setUser({
            id: guestId,
            email: 'guest@example.com',
            name: 'Guest User'
          });
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        // Create guest session if there's an error
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setUser({
          id: guestId,
          email: 'guest@example.com',
          name: 'Guest User'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        try {
          // Try to get user profile from users table
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              phone: profile.phone,
              created_at: profile.created_at
            });
            
            // Track user login
            analyticsService.trackEvent({
              event: 'user_login',
              category: 'auth',
              action: 'login',
              userId: profile.id
            });
          } else {
            // Fallback to basic auth data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email || 'User'
            });
            
            // Track user login
            analyticsService.trackEvent({
              event: 'user_login',
              category: 'auth',
              action: 'login',
              userId: session.user.id
            });
          }
        } catch (error) {
          // Fallback to basic auth data
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || 'User'
          });
          
          // Track user login
          analyticsService.trackEvent({
            event: 'user_login',
            category: 'auth',
            action: 'login',
            userId: session.user.id
          });
        }
      } else {
        // User logged out
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login({ email, password });
      
      // Track successful login
      analyticsService.trackEvent({
        event: 'login_success',
        category: 'auth',
        action: 'success',
        metadata: {
          email: email
        }
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Track failed login
      analyticsService.logError({
        error: 'LoginFailed',
        message: error.message || 'Login failed',
        component: 'UserContext.login',
        severity: 'medium',
        metadata: {
          email: email
        }
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      console.log('UserContext signup called with:', { name, email, password: password.length, phone });
      setIsLoading(true);
      
      // Track signup attempt
      analyticsService.trackEvent({
        event: 'signup_attempt',
        category: 'auth',
        action: 'attempt',
        metadata: {
          email: email,
          name: name
        }
      });
      
      const result = await authService.signup({ name, email, password, phone });
      console.log('UserContext signup successful');
      
      // Track successful signup
      analyticsService.trackEvent({
        event: 'signup_success',
        category: 'auth',
        action: 'success',
        metadata: {
          email: email,
          name: name
        }
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('UserContext signup error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Track signup error
      analyticsService.logError({
        error: 'SignupError',
        message: error.message || 'Unknown signup error',
        component: 'UserContext.signup',
        severity: 'high',
        metadata: {
          email: email,
          name: name
        }
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Track user logout
      if (user?.id) {
        analyticsService.trackEvent({
          event: 'user_logout',
          category: 'auth',
          action: 'logout',
          userId: user.id
        });
      }
      
      await authService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Track logout error
      analyticsService.logError({
        error: 'LogoutError',
        message: error instanceof Error ? error.message : 'Unknown logout error',
        component: 'UserContext.logout',
        severity: 'medium'
      });
    }
  };

  const refreshUser = async () => {
    if (!session?.user.id) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (!error && profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          created_at: profile.created_at
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, session, isLoading, login, signup, logout, refreshUser, createGuestSession }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};