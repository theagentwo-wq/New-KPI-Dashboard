import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// netlify/functions/firebase-config-proxy.ts
var handler = async () => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    // Allow requests from any origin
  };
  const configStr = process.env.FIREBASE_CLIENT_CONFIG;
  let cleanedConfigStr = configStr.trim();
  try {
    if (cleanedConfigStr.startsWith("'") && cleanedConfigStr.endsWith("'") || cleanedConfigStr.startsWith('"') && cleanedConfigStr.endsWith('"')) {
      cleanedConfigStr = cleanedConfigStr.substring(1, cleanedConfigStr.length - 1);
    }
    const configObject = JSON.parse(cleanedConfigStr);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(configObject)
    };
  } catch (error) {
    console.error("Failed to parse Firebase config on server:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to parse Firebase config on the server. The value provided is not valid JSON.",
        // Send back the original, raw value for better client-side debugging.
        rawValue: configStr
      })
    };
  }
};
export {
  handler
};
