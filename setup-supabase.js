// Script to update Supabase credentials
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');

// New Supabase credentials
const supabaseCredentials = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://gphdrsfbypnckxbdjjap.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDAwMjIsImV4cCI6MjA1OTE3NjAyMn0.skYsz1EJGdRwo5RW6HLljpy-D2KcQmBPJHYXb7MeyJw',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYwMDAyMiwiZXhwIjoyMDU5MTc2MDIyfQ.7gLACC4EsPkvDI2IbwGjeftBu5KwYfzujBT5KzEL6sQ'
};

function updateEnvFile() {
  console.log('Updating Supabase credentials in .env.local...');
  
  let envContent = '';
  
  // Read existing env file if it exists
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Update each credential in the existing file
    Object.keys(supabaseCredentials).forEach(key => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        // Replace existing credential
        envContent = envContent.replace(regex, `${key}=${supabaseCredentials[key]}`);
      } else {
        // Add new credential if it doesn't exist
        envContent += `\n${key}=${supabaseCredentials[key]}`;
      }
    });
  } else {
    // Create new env file with credentials
    Object.keys(supabaseCredentials).forEach(key => {
      envContent += `${key}=${supabaseCredentials[key]}\n`;
    });
  }
  
  // Write updated content to file
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ .env.local file updated successfully with new Supabase credentials!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run check-database');
  console.log('2. Run: npm run fix-ai-providers');
  console.log('3. Run: npm run migrate-api-keys');
  console.log('4. Verify connection: node verify-supabase.js');
}

// Run the update
updateEnvFile(); 