// debug-auth.js
// Debug script to check authentication issues

const { supabase } = require('./lib/supabase');

async function debugAuth() {
  console.log('=== Authentication Debug ===\n');
  
  try {
    // Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: test, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Supabase connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful\n');
    
    // Check users table structure
    console.log('2. Checking users table structure...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`  User ${index + 1}:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.name}`);
      console.log(`    Role ID: ${user.role_id}`);
      // Don't log sensitive data like passwords
      console.log('---');
    });
    
    // Check user roles
    console.log('\n3. Checking user roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.log('❌ Error fetching roles:', rolesError.message);
    } else {
      console.log(`Found ${roles.length} roles:`);
      roles.forEach(role => {
        console.log(`  ${role.id}: ${role.name} - ${role.description}`);
      });
    }
    
    // Test login with a sample user
    if (users.length > 0) {
      console.log('\n4. Testing login simulation...');
      const sampleUser = users[0];
      console.log(`Trying to simulate login for user: ${sampleUser.email}`);
      
      // Check if this user has a password field
      console.log('User object keys:', Object.keys(sampleUser));
    }
    
  } catch (error) {
    console.error('Debug failed with error:', error);
  }
}

// Run debug if this file is executed directly
if (require.main === module) {
  debugAuth();
}

module.exports = { debugAuth };