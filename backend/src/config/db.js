const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const initializeDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    const { error } = await supabase.rpc('create_users_table');
    
    if (error && !error.message.includes('already exists')) {
      console.error('Database initialization error:', error.message);
    } else {
      console.log('Database tables initialized successfully');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// SQL function to create users table
const createUsersTableSQL = `
  CREATE OR REPLACE FUNCTION create_users_table()
  RETURNS void AS $$
  BEGIN
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      aadhaar_number VARCHAR(12),
      aadhaar_name VARCHAR(100),
      aadhaar_dob VARCHAR(20),
      aadhaar_address TEXT,
      is_kyc_verified BOOLEAN DEFAULT FALSE,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  END;
  $$ LANGUAGE plpgsql;
`;

const setupDatabase = async () => {
  try {
    // Execute the SQL to create the function first
    const { error: funcError } = await supabase.rpc('exec_sql', { 
      sql: createUsersTableSQL 
    });
    
    if (funcError) {
      // Fallback: try to create table directly
      const { error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        console.log('Please create the users table in your Supabase database:');
        console.log(`
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  aadhaar_number VARCHAR(12),
  aadhaar_name VARCHAR(100),
  aadhaar_dob VARCHAR(20),
  aadhaar_address TEXT,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);
        `);
      }
    }
    
    console.log('Supabase database connection established');
  } catch (error) {
    console.error('Database setup error:', error.message);
  }
};

module.exports = { supabase, initializeDatabase: setupDatabase };
