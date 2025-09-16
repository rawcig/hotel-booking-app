// context/AdminContext.tsx
// Context to manage admin authentication state

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminService, Admin } from '@/api/services/admin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define context type
interface AdminContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// Create context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load admin from storage on app start
  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const adminData = await AsyncStorage.getItem('adminSession');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
      }
    } catch (error) {
      console.error('Error loading admin session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminService.login({ email, password });
      setAdmin(response.admin);
      await AsyncStorage.setItem('adminSession', JSON.stringify(response.admin));
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminService.logout();
      setAdmin(null);
      await AsyncStorage.removeItem('adminSession');
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  const isAdmin = adminService.isAdmin(admin);
  const isSuperAdmin = adminService.isSuperAdmin(admin);

  return (
    <AdminContext.Provider value={{ admin, isLoading, login, logout, isAdmin, isSuperAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};