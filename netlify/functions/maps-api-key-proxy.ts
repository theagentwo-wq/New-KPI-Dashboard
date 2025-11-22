// This function runs on Netlify's backend and securely provides
// the Google Maps Platform API key to the frontend.

export const handler = async () => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
    };

    // The new build script (scripts/validate-env.js) guarantees this key exists.
    // Using the '!' non-null assertion is now safe and tells TypeScript to trust us.
    const mapsApiKey = process.env.MAPS_API_KEY!;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ apiKey: mapsApiKey }),
    };
};


