// components/AdminGuard.tsx
// Component to protect admin routes

import React, { useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function AdminGuard({ children, requireSuperAdmin = false }: AdminGuardProps) {
  const { admin, isLoading, isSuperAdmin } = useAdmin();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if we're in an admin route
  const isAdminRoute = segments[0] === 'admin';
  
  useEffect(() => {
    if (!isLoading) {
      // If not logged in and trying to access admin routes, redirect to admin login
      if (!admin && isAdminRoute && segments[1] !== 'login') {
        router.replace('/admin/login');
      }
      // If logged in as regular user and trying to access admin routes, redirect to admin login
      else if (admin && isAdminRoute && segments[1] === 'login') {
        router.replace('/admin/dashboard');
      }
      // If logged in but not super admin and super admin is required, redirect to dashboard
      else if (admin && requireSuperAdmin && !isSuperAdmin && isAdminRoute) {
        router.replace('/admin/dashboard');
      }
    }
  }, [admin, isLoading, isSuperAdmin, isAdminRoute, requireSuperAdmin]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading admin session...</Text>
      </View>
    );
  }
  
  // If not authenticated and trying to access protected admin routes, don't render children
  if (!admin && isAdminRoute && segments[1] !== 'login') {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Redirecting to admin login...</Text>
      </View>
    );
  }
  
  // If super admin is required but user is not super admin
  if (requireSuperAdmin && admin && !isSuperAdmin && isAdminRoute) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-6xl mb-4">🚫</Text>
        <Text className="text-red-500 text-xl font-semibold mb-2">Access Denied</Text>
        <Text className="text-gray-500 text-center">
          You don't have permission to access this page. Only super administrators can access this section.
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/admin/dashboard')}
          className="bg-blue-500 py-3 px-6 rounded-xl mt-6"
        >
          <Text className="text-white font-medium">Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render children if authenticated or accessing public routes
  return <>{children}</>;
}