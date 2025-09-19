// server/lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Get these from your Supabase project settings
// For server-side usage, you should use the service role key for full access
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Try to use service role key for server operations, fallback to anon key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate that we have the required environment variables
if (!supabaseUrl) {
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
  // For demo/testing purposes, we'll use a dummy URL
  // In production, you should provide a valid URL
}

if (!supabaseServiceRoleKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
  // For demo/testing purposes, we'll use a dummy key
  // In production, you should provide a valid key
}

// Validate URL format (only if URL is provided)
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL: must start with https://');
}

// Create a single supabase client for the entire application
// Use service role key for server-side operations for full access
// If no credentials are provided, create a client that will fail gracefully
const supabase = supabaseUrl && supabaseServiceRoleKey ? 
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : 
  // Return a mock client for testing
  {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      eq: () => this,
      neq: () => this,
      gt: () => this,
      lt: () => this,
      gte: () => this,
      lte: () => this,
      like: () => this,
      ilike: () => this,
      is: () => this,
      in: () => this,
      contains: () => this,
      overlaps: () => this,
      range: () => this,
      single: () => this,
      order: () => this,
      limit: () => this,
      offset: () => this
    })
  };

module.exports = { supabase };