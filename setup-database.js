require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync('supabase_schema.sql', 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          console.warn(`Warning on statement ${i + 1}:`, error.message);
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`Warning on statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('\nDatabase setup completed!');
    console.log('Verifying tables...');
    
    // Verify tables exist
    const tables = ['user_profiles', 'user_preferences', 'chats', 'chat_messages'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' - ${error.message}`);
        } else {
          console.log(`✓ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
