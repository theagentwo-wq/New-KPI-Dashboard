import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

// scripts/validate-env.js
import 'node:process';

const requiredEnvVars = [
  'GEMINI_API_KEY',
  'MAPS_API_KEY',
  'FIREBASE_CLIENT_CONFIG',
];

let hasError = false;

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error('\x1b[31m%s\x1b[0m', `ERROR: Missing required environment variable: ${varName}`);
    hasError = true;
  }
});

if (!hasError && process.env.FIREBASE_CLIENT_CONFIG) {
  try {
    let cleanedConfigStr = process.env.FIREBASE_CLIENT_CONFIG.trim();
    if ((cleanedConfigStr.startsWith("'") && cleanedConfigStr.endsWith("'")) || (cleanedConfigStr.startsWith('"') && cleanedConfigStr.endsWith('"'))) {
        cleanedConfigStr = cleanedConfigStr.substring(1, cleanedConfigStr.length - 1);
    }
    JSON.parse(cleanedConfigStr);
    console.log('✅ FIREBASE_CLIENT_CONFIG is valid JSON.');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: FIREBASE_CLIENT_CONFIG is NOT valid JSON.');
    console.error('Please ensure the value for FIREBASE_CLIENT_CONFIG is a single-line, correctly formatted JSON string.');
    console.error(`Parsing error: ${error instanceof Error ? error.message : String(error)}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\nPlease correct the environment variables and try deploying again.');
  console.error('Refer to the README.md for instructions on how to configure these keys.');
  process.exit(1); // Exit with a failure code
}

console.log('All required environment variables are present and valid.');