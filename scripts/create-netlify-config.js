// scripts/create-netlify-config.js
const fs = require('fs');
const path = require('path');

const tomlContent = `# Netlify configuration for timeouts and background functions

# Set the default timeout for all synchronous serverless functions to 25 seconds.
# This provides a buffer for long-running AI analysis tasks in the Universal Data Hub.
[functions]
  timeout = 25

# Define 'process-analysis-job' as a background function.
# This allows it to run for up to 15 minutes, which is essential for the
# asynchronous, long-running tasks in the AI Strategy Hub, preventing 502 errors.
[functions."process-analysis-job"]
  background = true
`;

// The script is in /scripts, so we go up one level to the project root.
const filePath = path.join(__dirname, '..', 'netlify.toml');

try {
  fs.writeFileSync(filePath, tomlContent.trim());
  console.log('Successfully created clean netlify.toml file.');
} catch (error) {
  console.error('Failed to create netlify.toml file:', error);
  process.exit(1); // Exit with a failure code to stop the build
}
