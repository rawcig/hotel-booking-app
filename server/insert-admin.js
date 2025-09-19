// insert-admin.js
// Script to insert an admin account directly into the database

const { supabase } = require('./lib/supabase');

async function insertAdminAccount() {
  console.log('=== Inserting Admin Account ===\n');
  
  try {
    // First, let's check if the admin user already exists
    console.log('1. Checking if admin user already exists...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error checking for existing admin:', checkError.message);
      return;
    }
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role ID: ${existingAdmin.role_id}`);
      
      // Ask if user wants to update the existing admin
      console.log('\nWould you like to update this admin user? (y/n)');
      // In a real script, you'd handle user input here
      return;
    }
    
    // Check if user roles exist
    console.log('\n2. Checking user roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    let adminRoleId = 1; // Default admin role ID
    
    if (rolesError) {
      console.log('❌ Error fetching roles:', rolesError.message);
    } else if (roles && roles.length > 0) {
      console.log(`✅ Found ${roles.length} roles`);
      // Look for admin role
      const adminRole = roles.find(r => r.name === 'admin');
      if (adminRole) {
        adminRoleId = adminRole.id;
        console.log(`✅ Using existing admin role (ID: ${adminRoleId})`);
      } else {
        console.log('⚠️  No admin role found, using default ID: 1');
      }
    } else {
      console.log('⚠️  No roles found, creating default admin role...');
      // Create admin role if it doesn't exist
      const { data: newRole, error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            id: 1,
            name: 'admin',
            description: 'Administrator with full access'
          }
        ])
        .select()
        .single();
      
      if (roleError) {
        console.log('❌ Error creating admin role:', roleError.message);
      } else {
        adminRoleId = newRole.id;
        console.log(`✅ Created admin role (ID: ${adminRoleId})`);
      }
    }
    
    // Insert admin user
    console.log('\n3. Inserting admin user...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@example.com',
          name: 'Admin User',
          phone: '+1234567890',
          role_id: adminRoleId
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error inserting admin user:', insertError.message);
      
      // Try alternative approach without specifying ID
      console.log('\n4. Trying alternative approach...');
      const { data: altUser, error: altError } = await supabase
        .from('users')
        .insert([
          {
            email: 'admin@example.com',
            name: 'Admin User',
            phone: '+1234567890',
            role_id: adminRoleId
          }
        ])
        .select();
      
      if (altError) {
        console.log('❌ Alternative approach also failed:', altError.message);
        return;
      }
      
      console.log('✅ Admin user created successfully (alternative approach)');
      console.log('User ID:', altUser[0].id);
    } else {
      console.log('✅ Admin user created successfully');
      console.log('User ID:', newUser.id);
    }
    
    // Display login credentials
    console.log('\n=== ADMIN ACCOUNT CREATED ===');
    console.log('Email: admin@example.com');
    console.log('Password: (no password needed for this demo - any password will work)');
    console.log('Role: Admin');
    console.log('\nYou can now log in to the admin panel with these credentials.');
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Script failed with error:', error);
  }
}

// Run the script if executed directly
if (require.main === module) {
  insertAdminAccount();
}

module.exports = { insertAdminAccount };