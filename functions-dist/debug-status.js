// netlify/functions/debug-status.ts
var handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Debug function is working!",
      nodeVersion: process.version,
      env: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasMapsKey: !!process.env.MAPS_API_KEY,
        hasFirebaseConfig: !!process.env.FIREBASE_CLIENT_CONFIG
      }
    })
  };
};
export {
  handler
};
