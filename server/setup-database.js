// setup-database.js
// Script to set up the database with initial data

const { supabase } = require('./lib/supabase');

async function setupDatabase() {
  console.log('=== Setting up Database ===\n');
  
  try {
    // 1. Create default user roles
    console.log('1. Setting up user roles...');
    await setupUserRoles();
    
    // 2. Create admin user
    console.log('\n2. Setting up admin user...');
    await setupAdminUser();
    
    // 3. Create sample hotels (if none exist)
    console.log('\n3. Setting up sample hotels...');
    await setupSampleHotels();
    
    // 4. Set up storage buckets
    console.log('\n4. Setting up storage information...');
    await setupStorageBuckets();
    
    console.log('\n=== Database Setup Complete ===');
    console.log('✅ Database is ready for use!');
    console.log('\nStorage setup:');
    console.log('  Create a "hotel-images" bucket in your Supabase Storage dashboard');
    console.log('\nYou can now log in to the admin panel.');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

async function setupUserRoles() {
  try {
    // Check if roles already exist
    const { data: existingRoles, error: fetchError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (fetchError) {
      console.log('❌ Error checking existing roles:', fetchError.message);
      return;
    }
    
    if (existingRoles && existingRoles.length > 0) {
      console.log('✅ User roles already exist');
      return;
    }
    
    // Create default roles
    const defaultRoles = [
      { id: 1, name: 'admin', description: 'Administrator with full access' },
      { id: 2, name: 'user', description: 'Regular user' },
      { id: 3, name: 'staff', description: 'Hotel staff member' },
      { id: 4, name: 'manager', description: 'Hotel manager' }
    ];
    
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(defaultRoles);
    
    if (insertError) {
      console.log('❌ Error creating default roles:', insertError.message);
    } else {
      console.log('✅ Created default user roles');
    }
  } catch (error) {
    console.error('Error in setupUserRoles:', error);
  }
}

async function setupAdminUser() {
  try {
    // Check if admin user already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('❌ Error checking existing admin user:', fetchError.message);
      return;
    }
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@example.com',
          name: 'Admin User',
          phone: '+1234567890',
          role_id: 1 // admin role
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error creating admin user:', insertError.message);
    } else {
      console.log('✅ Created admin user');
    }
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
  }
}

async function setupSampleHotels() {
  try {
    // Check if hotels already exist
    const { data: existingHotels, error: fetchError } = await supabase
      .from('hotels')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.log('❌ Error checking existing hotels:', fetchError.message);
      return;
    }
    
    if (existingHotels && existingHotels.length > 0) {
      console.log('✅ Sample hotels already exist');
      return;
    }
    
    // Create sample hotels
    const sampleHotels = [
      {
        name: 'Grand Palace Hotel',
        location: 'Downtown',
        distance: '2.1 km away',
        rating: '4.8',
        price: '120',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        gallery: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        description: 'Experience luxury at its finest at Grand Palace Hotel. Located in the heart of downtown.',
        amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa'],
        coordinates: { latitude: 37.7749, longitude: -122.4194 }
      },
      {
        name: 'Ocean View Resort',
        location: 'Beachfront',
        distance: '5.3 km away',
        rating: '4.6',
        price: '89',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
        gallery: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        description: 'Wake up to breathtaking ocean views every morning at Ocean View Resort.',
        amenities: ['Beach Access', 'Water Sports', 'Ocean View Rooms', 'Beach Bar'],
        coordinates: { latitude: 37.7849, longitude: -122.4094 }
      }
    ];
    
    const { error: insertError } = await supabase
      .from('hotels')
      .insert(sampleHotels);
    
    if (insertError) {
      console.log('❌ Error creating sample hotels:', insertError.message);
    } else {
      console.log('✅ Created sample hotels');
    }
  } catch (error) {
    console.error('Error in setupSampleHotels:', error);
  }
}

async function setupStorageBuckets() {
  try {
    console.log('\n4. Setting up storage buckets...');
    
    // Note: In Supabase, storage buckets are typically created through the dashboard
    // For programmatic setup, we would need to use the Supabase Storage Admin API
    // which requires service key permissions
    
    console.log('ℹ️  Storage buckets should be created manually in the Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to Storage → Buckets');
    console.log('   3. Create a new bucket named "hotel-images"');
    console.log('   4. Set it as public for hotel images to be accessible');
    
  } catch (error) {
    console.log('Error in setupStorageBuckets:', error);
  }
}

module.exports = { setupDatabase };

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };