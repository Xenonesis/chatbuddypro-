const { spawn } = require('child_process');

console.log('Starting Next.js development server...');

const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});

nextDev.on('error', (err) => {
  console.error('Failed to start Next.js dev server:', err);
});
