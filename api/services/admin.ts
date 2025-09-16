// api/services/admin.ts
// Service to handle admin authentication and authorization

import { supabase } from '@/lib/supabase';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
}

export const adminService = {
  // Admin login
  login: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
    try {
      // For demo purposes, we'll simulate admin login
      // In a real app, you would implement proper authentication
      
      // Check if this is a demo admin account
      if (data.email === 'admin@hotel.com' && data.password === 'admin123') {
        return {
          admin: {
            id: 1,
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@hotel.com',
            role: 'administrator',
            is_active: true
          },
          token: 'demo_admin_token_12345'
        };
      }
      
      // For other cases, check against staff table
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('email', data.email)
        .eq('is_active', true)
        .single();
      
      if (error) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, you would verify the password here
      // For demo, we'll just check if the staff member exists
      
      if (!staff) {
        throw new Error('Invalid credentials');
      }
      
      // Check if staff member has admin role
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', staff.role_id)
        .single();
      
      if (roleError || !role) {
        throw new Error('Invalid role');
      }
      
      // Check if role is admin or manager
      if (role.name !== 'administrator' && role.name !== 'manager') {
        throw new Error('Insufficient permissions');
      }
      
      return {
        admin: {
          id: staff.id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          email: staff.email,
          role: role.name,
          is_active: staff.is_active
        },
        token: 'staff_token_' + staff.id
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to login as admin');
    }
  },

  // Admin logout
  logout: async (): Promise<void> => {
    // In a real app, you would invalidate the token
    // For demo, we'll just return
    return Promise.resolve();
  },

  // Check if user is admin
  isAdmin: (admin: Admin | null): boolean => {
    if (!admin) return false;
    return admin.role === 'administrator' || admin.role === 'manager';
  },

  // Check if user is super admin
  isSuperAdmin: (admin: Admin | null): boolean => {
    if (!admin) return false;
    return admin.role === 'administrator';
  }
};