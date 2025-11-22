import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// netlify/functions/maps-api-key-proxy.ts
var handler = async () => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    // Allow requests from any origin
  };
  const mapsApiKey = process.env.MAPS_API_KEY;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ apiKey: mapsApiKey })
  };
};
export {
  handler
};
