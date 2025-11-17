// This function runs on Netlify's backend and securely provides
// the Firebase client configuration to the frontend without exposing it in the build output.

export const handler = async () => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    };
    
    // Reads the config from the server-side environment variable.
    const configStr = process.env.FIREBASE_CLIENT_CONFIG;

    if (!configStr) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Firebase config environment variable (FIREBASE_CLIENT_CONFIG) is not set on the server." }),
        };
    }
    
    // Define here to be accessible in the catch block
    let cleanedConfigStr = configStr.trim();

    try {
        // More robust parsing:
        // 1. Check for and remove surrounding quotes (either ' or ").
        if ((cleanedConfigStr.startsWith("'") && cleanedConfigStr.endsWith("'")) || (cleanedConfigStr.startsWith('"') && cleanedConfigStr.endsWith('"'))) {
            cleanedConfigStr = cleanedConfigStr.substring(1, cleanedConfigStr.length - 1);
        }
        
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
            body: JSON.stringify({ 
                error: "Failed to parse Firebase config on the server. The value provided is not valid JSON.",
                // Send back the original, raw value for better client-side debugging.
                rawValue: configStr 
            }),
        };
    }
};