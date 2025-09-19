// test-database.js
// Script to test database connection and basic queries

const { supabase } = require('./lib/supabase');

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1. Testing Supabase connection...');
    const { data, error } = await supabase
      .from('hotels')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Check if hotels table exists
    console.log('\n2. Checking hotels table...');
    const { count: hotelsCount, error: hotelsError } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true });
    
    if (hotelsError) {
      console.error('❌ Hotels table check failed:', hotelsError.message);
    } else {
      console.log(`✅ Hotels table exists with ${hotelsCount || 0} records`);
    }
    
    // Test 3: Check if bookings table exists
    console.log('\n3. Checking bookings table...');
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    if (bookingsError) {
      console.error('❌ Bookings table check failed:', bookingsError.message);
    } else {
      console.log(`✅ Bookings table exists with ${bookingsCount || 0} records`);
    }
    
    // Test 4: Check if users table exists
    console.log('\n4. Checking users table...');
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('❌ Users table check failed:', usersError.message);
    } else {
      console.log(`✅ Users table exists with ${usersCount || 0} records`);
    }
    
    // Test 5: Check if user_roles table exists
    console.log('\n5. Checking user_roles table...');
    const { count: rolesCount, error: rolesError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true });
    
    if (rolesError) {
      console.error('❌ User roles table check failed:', rolesError.message);
    } else {
      console.log(`✅ User roles table exists with ${rolesCount || 0} records`);
    }
    
    // Test 6: Check if staff table exists
    console.log('\n6. Checking staff table...');
    const { count: staffCount, error: staffError } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true });
    
    if (staffError) {
      console.error('❌ Staff table check failed:', staffError.message);
    } else {
      console.log(`✅ Staff table exists with ${staffCount || 0} records`);
    }
    
    // Test 7: Check if notifications table exists
    console.log('\n7. Checking notifications table...');
    const { count: notificationsCount, error: notificationsError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });
    
    if (notificationsError) {
      console.error('❌ Notifications table check failed:', notificationsError.message);
    } else {
      console.log(`✅ Notifications table exists with ${notificationsCount || 0} records`);
    }
    
    // Test 8: Check if payments table exists
    console.log('\n8. Checking payments table...');
    const { count: paymentsCount, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    
    if (paymentsError) {
      console.error('❌ Payments table check failed:', paymentsError.message);
    } else {
      console.log(`✅ Payments table exists with ${paymentsCount || 0} records`);
    }
    
    console.log('\n🎉 Database connection test completed!');
    
  } catch (error) {
    console.error('❌ Database test failed with error:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };