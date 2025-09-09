// server/lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Get these from your Supabase project settings
// For server-side usage, you should use the service role key for full access
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Try to use service role key for server operations, fallback to anon key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate that we have the required environment variables
if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL: must start with https://');
}

// Create a single supabase client for the entire application
// Use service role key for server-side operations for full access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase };