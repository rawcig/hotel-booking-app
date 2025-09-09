// utils/testSupabase.ts
import { testSupabaseConnection } from '@/lib/supabase';

export const runSupabaseTest = async () => {
  console.log('Testing Supabase connection...');
  const result = await testSupabaseConnection();
  
  if (result.success) {
    console.log('✅ Supabase connection successful!');
    console.log('Test data:', result.data);
  } else {
    console.error('❌ Supabase connection failed:', result.error);
  }
  
  return result;
};