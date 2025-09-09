// api/services/auth.ts
import { supabase } from '@/lib/supabase';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
  token: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const { data: session, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!session.user) {
      throw new Error('Login failed');
    }
    
    // Get user profile data
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return {
      user: {
        id: session.user.id,
        name: profile?.name || session.user.email || '',
        email: session.user.email || '',
        phone: profile?.phone || null,
        role: profile?.role || 'user',
      },
      token: session.session?.access_token || '',
    };
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    if (authError) {
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error('Signup failed');
    }
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          role: 'user',
        },
      ])
      .select()
      .single();
    
    if (profileError) {
      throw new Error(profileError.message);
    }
    
    return {
      user: {
        id: authData.user.id,
        name: profile.name,
        email: authData.user.email || '',
        phone: profile.phone,
        role: profile.role,
      },
      token: authData.session?.access_token || '',
    };
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  getCurrentUser: async (): Promise<AuthResponse | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    // Get user profile data
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return {
      user: {
        id: session.user.id,
        name: profile?.name || session.user.email || '',
        email: session.user.email || '',
        phone: profile?.phone || null,
        role: profile?.role || 'user',
      },
      token: session.access_token || '',
    };
  },
};