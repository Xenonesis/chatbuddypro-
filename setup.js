const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create .env.local file from .env.example if it doesn't exist
const envExamplePath = path.join(__dirname, '.env.example');
const envLocalPath = path.join(__dirname, '.env.local');

console.log('AI Chatbot Setup');
console.log('================');
console.log('This script will help you set up your environment variables for the AI Chatbot.');
console.log('');

if (!fs.existsSync(envExamplePath)) {
  console.error('Error: .env.example file not found.');
  process.exit(1);
}

if (fs.existsSync(envLocalPath)) {
  console.log('.env.local file already exists.');
  rl.question('Do you want to overwrite it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupEnvFile();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvFile();
}

function setupEnvFile() {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  // Extract the variables from the example file
  const variableMatches = envExample.match(/^NEXT_PUBLIC_(\w+)_API_KEY=/gm);
  const variables = variableMatches ? variableMatches.map(v => v.replace('=', '')) : [];
  
  if (variables.length === 0) {
    console.error('Error: No API key variables found in .env.example.');
    rl.close();
    return;
  }
  
  let envContent = envExample;
  const askForVariable = (index) => {
    if (index >= variables.length) {
      fs.writeFileSync(envLocalPath, envContent);
      console.log('\n.env.local file created successfully!');
      console.log('You can now run the application with:');
      console.log('  npm run dev');
      rl.close();
      return;
    }
    
    const variable = variables[index];
    rl.question(`Enter your ${variable} (leave empty to skip): `, (value) => {
      if (value.trim()) {
        // Replace the placeholder with the actual value
        envContent = envContent.replace(`${variable}=your_${variable.toLowerCase().replace('next_public_', '').replace('_api_key', '')}_api_key_here`, `${variable}=${value.trim()}`);
      }
      askForVariable(index + 1);
    });
  };
  
  console.log('Enter your API keys for the following services:');
  console.log('(Leave empty to skip a service)');
  console.log('');
  askForVariable(0);
} 