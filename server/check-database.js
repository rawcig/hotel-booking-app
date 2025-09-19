// check-database.js
// Script to check database tables and create initial data if needed

const { supabase } = require('./lib/supabase');

async function checkAndSetupDatabase() {
  console.log('=== Database Setup Check ===\n');
  
  try {
    // Check if user_roles table exists and has data
    console.log('1. Checking user_roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.log('❌ Error accessing user_roles:', rolesError.message);
    } else {
      console.log(`✅ user_roles table exists with ${roles.length} records`);
      if (roles.length === 0) {
        console.log('⚠️  user_roles table is empty, creating default roles...');
        await createDefaultRoles();
      }
    }
    
    // Check if users table exists
    console.log('\n2. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log('❌ Error accessing users:', usersError.message);
    } else {
      console.log(`✅ users table exists with ${users.length} records`);
    }
    
    // Check if hotels table exists
    console.log('\n3. Checking hotels table...');
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('*');
    
    if (hotelsError) {
      console.log('❌ Error accessing hotels:', hotelsError.message);
    } else {
      console.log(`✅ hotels table exists with ${hotels.length} records`);
    }
    
    // Check if bookings table exists
    console.log('\n4. Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');
    
    if (bookingsError) {
      console.log('❌ Error accessing bookings:', bookingsError.message);
    } else {
      console.log(`✅ bookings table exists with ${bookings.length} records`);
    }
    
    console.log('\n=== Database Check Complete ===');
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

async function createDefaultRoles() {
  try {
    console.log('Creating default user roles...');
    
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user' },
      { name: 'staff', description: 'Hotel staff member' },
      { name: 'manager', description: 'Hotel manager' }
    ];
    
    for (const role of defaultRoles) {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([role])
        .select();
      
      if (error) {
        console.log(`⚠️  Could not create role ${role.name}:`, error.message);
      } else {
        console.log(`✅ Created role: ${role.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating default roles:', error);
  }
}

// Run check if this file is executed directly
if (require.main === module) {
  checkAndSetupDatabase();
}

module.exports = { checkAndSetupDatabase };