// This function runs on Netlify's backend and securely provides
// the Google Maps Platform API key to the frontend.

export const handler = async () => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    };
    
    // Reads the Maps API key from the server-side environment variable.
    const mapsApiKey = process.env.MAPS_API_KEY;

    if (!mapsApiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Google Maps API key (MAPS_API_KEY) is not set on the server. Please check your Netlify site settings and the README file." }),
        };
    }
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ apiKey: mapsApiKey }),
    };
};