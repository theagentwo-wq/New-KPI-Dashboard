// scripts/validate-env.js

const requiredEnvVars = [
  'GEMINI_API_KEY',
  'MAPS_API_KEY',
  'FIREBASE_CLIENT_CONFIG',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing required environment variables.');
  console.error('The following environment variables are not set in your Netlify configuration:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease add these variables to your Netlify site settings and try deploying again.');
  console.error('Refer to the README.md for instructions on how to configure these keys.');
  process.exit(1); // Exit with a failure code
}

console.log('All required environment variables are present.');