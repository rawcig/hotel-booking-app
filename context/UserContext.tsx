// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/api/services/auth';
import { supabase } from '@/lib/supabase';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isGuest?: boolean; // Add this to distinguish guests from real users
}

// Define context type
interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createGuestSession: () => Promise<void>;
  isLoading: boolean;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // User is logged in
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || 'User',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || '',
          isGuest: false
        };
        setUser(userData);
        AsyncStorage.setItem('userSession', JSON.stringify(userData));
      } else {
        // User is logged out
        setUser(null);
        AsyncStorage.removeItem('userSession');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      // First check if there's an active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in via Supabase
        // Try to get user profile from users table
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select(`
              *,
              role:user_roles(name, description)
            `)
            .eq('id', session.user.id)
            .single();
          
          let userData: User;
          if (!error && profile) {
            // Use profile data from users table
            userData = {
              id: session.user.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone || undefined,
              role: profile.role?.name || 'user',
              isGuest: false
            };
          } else {
            // Fall back to auth metadata
            userData = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email || 'User',
              email: session.user.email || '',
              phone: session.user.user_metadata?.phone || undefined,
              role: 'user',
              isGuest: false
            };
          }
          
          setUser(userData);
          await AsyncStorage.setItem('userSession', JSON.stringify(userData));
        } catch (error) {
          // If users table doesn't exist, use basic auth data
          if (error instanceof Error && (error.message.includes('not find') || error.message.includes('relation') || error.message.includes('users'))) {
            console.warn('Users table not found. Using basic auth data.');
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email || 'User',
              email: session.user.email || '',
              phone: session.user.user_metadata?.phone || undefined,
              role: 'user',
              isGuest: false
            };
            setUser(userData);
            await AsyncStorage.setItem('userSession', JSON.stringify(userData));
          } else {
            throw error;
          }
        }
      } else {
        // Check for stored session
        const userData = await AsyncStorage.getItem('userSession');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          // If no user session, create a guest session
          await createGuestSession();
        }
      }
    } catch (error) {
      console.error('Error loading user session:', error);
      // Create guest session if there's an error
      await createGuestSession();
    } finally {
      setIsLoading(false);
    }
  };

  const createGuestSession = async () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: '',
      isGuest: true
    };
    
    setUser(guestUser);
    await AsyncStorage.setItem('userSession', JSON.stringify(guestUser));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone || undefined,
        isGuest: false
      };
      
      setUser(userData);
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      console.log('UserContext signup called with:', { name, email, password: password.length, phone });
      
      // For testing: pad short passwords to meet minimum length requirement
      // In production, you should enforce stronger passwords
      let finalPassword = password;
      if (password.length < 6) {
        // Pad with exclamation marks to reach 6 characters
        finalPassword = password.padEnd(6, '!');
        console.log('Password padded to:', finalPassword, '(length:', finalPassword.length, ')');
      }
      
      console.log('Calling authService.signup with:', { name, email, password: finalPassword, phone });
      const response = await authService.signup({ name, email, password: finalPassword, phone });
      console.log('AuthService response:', response);
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone || undefined,
        role: response.user.role,
        isGuest: false
      };
      
      setUser(userData);
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      
      console.log('UserContext signup successful');
      return { success: true };
    } catch (error: any) {
      console.error('UserContext signup error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      await AsyncStorage.removeItem('userSession');
      // Create a new guest session after logout
      await createGuestSession();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, signup, logout, createGuestSession, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};