#!/usr/bin/env node
// server/scripts/setup-database.js
// Script to set up the database with initial schema and seed data

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Get database connection from environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'hotel_booking';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASS || 'postgres';
const dbPort = process.env.DB_PORT || '5432';

console.log('Setting up database...');

async function setupDatabase() {
  try {
    // 1. Create database if it doesn't exist
    console.log('1. Creating database...');
    
    // Connect to postgres database to create our database
    const createDbCommand = `PGPASSWORD="${dbPass}" createdb -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName} 2>/dev/null || echo "Database already exists or creation failed"`;
    
    try {
      await execPromise(createDbCommand);
      console.log('Database created or already exists');
    } catch (error) {
      console.log('Database already exists or creation failed:', error.message);
    }
    
    // 2. Run schema creation scripts
    console.log('2. Running schema creation scripts...');
    
    const schemaDir = path.join(__dirname, '..', 'database', 'schema');
    const schemaFiles = [
      'create-tables.sql'
    ];
    
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Running ${file}...`);
        const command = `PGPASSWORD="${dbPass}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${filePath}"`;
        try {
          await execPromise(command);
          console.log(`Successfully ran ${file}`);
        } catch (error) {
          console.error(`Error running ${file}:`, error.message);
        }
      } else {
        console.log(`Schema file ${file} not found, skipping...`);
      }
    }
    
    // 3. Run seed data
    console.log('3. Seeding initial data...');
    
    const seedScript = path.join(__dirname, '..', 'database', 'seeds', 'seed-data.js');
    if (fs.existsSync(seedScript)) {
      console.log('Running seed script...');
      const command = `node "${seedScript}"`;
      try {
        await execPromise(command);
        console.log('Successfully seeded data');
      } catch (error) {
        console.error('Error seeding data:', error.message);
      }
    } else {
      console.log('Seed script not found, skipping...');
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };