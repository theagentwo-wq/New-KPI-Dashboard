// This function runs on Netlify's backend and securely provides
// the Firebase client configuration to the frontend without exposing it in the build output.

export const handler = async () => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    };
    
    // Reads the config from the server-side environment variable.
    // Note: The variable name must NOT start with VITE_
    const configStr = process.env.FIREBASE_CLIENT_CONFIG;

    if (!configStr) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Firebase config environment variable (FIREBASE_CLIENT_CONFIG) is not set on the server." }),
        };
    }

    try {
        // The config is stored as a single-quoted JSON string, e.g., '{"key":"value"}'
        // We need to clean it up, parse it, and then re-stringify it as a valid JSON response.
        const cleanedConfigStr = configStr.trim().replace(/^'|'$/g, '');
        const configObject = JSON.parse(cleanedConfigStr);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(configObject),
        };
    } catch (error) {
        console.error("Failed to parse Firebase config on server:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to parse Firebase config on the server. Ensure it is a valid single-line JSON string." }),
        };
    }
};
