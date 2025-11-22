// netlify/functions/maps-proxy.ts

// Type definitions for Google Maps API responses
interface FindPlaceResponse {
    candidates?: { place_id: string }[];
    status: string;
    error_message?: string;
}

interface PlaceDetailsResponse {
    result?: {
        name: string;
        rating: number;
        photos?: { photo_reference: string }[];
    };
    status: string;
    error_message?: string;
}

export const handler = async (event: any) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!process.env.MAPS_API_KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Server configuration error: MAPS_API_KEY is missing." })
        };
    }
    const mapsApiKey = process.env.MAPS_API_KEY;

    // Create a controller to abort external requests if they take too long
    const controller = new AbortController();
    // Set a timeout of 7000ms (7s) to be safe within Netlify's 10s limit
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
        const body = JSON.parse(event.body || '{}');
        const { address } = body;

        if (!address) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'address' in request payload." }) };
        }

        // Helper for fetch with timeout and standard headers
        const safeFetch = async (url: string) => {
            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Operations-KPI-Dashboard/1.0',
                        'Accept': 'application/json'
                    }
                });
                return response;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    throw new Error("External API timeout");
                }
                throw err;
            }
        };

        // Step 1: Find the Place ID
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`Tupelo Honey Southern Kitchen & Bar, ${address}`)}&inputtype=textquery&fields=place_id&key=${mapsApiKey}`;

        const findPlaceResponse = await safeFetch(findPlaceUrl);

        if (!findPlaceResponse.ok) {
            // Log the error but don't crash the UI
            console.warn(`Google Maps Find Place API failed with status ${findPlaceResponse.status}`);
            return {
                statusCode: 200, // Return 200 with empty data to graceful degrade
                headers,
                body: JSON.stringify({ data: { name: 'Location Details Unavailable', rating: 0, photoUrls: [] } })
            }
        }

        const findPlaceData = await findPlaceResponse.json() as FindPlaceResponse;

        if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: `Could not find location for "${address}".`,
                    details: `${findPlaceData.status} - ${findPlaceData.error_message || 'No candidates found'}`
                })
            };
        }
        const placeId = findPlaceData.candidates[0].place_id;

        // Step 2: Get Details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,photos&key=${mapsApiKey}`;
        const detailsResponse = await safeFetch(detailsUrl);

        if (!detailsResponse.ok) {
            throw new Error(`Google Maps Details API failed with status ${detailsResponse.status}`);
        }

        const detailsData = await detailsResponse.json() as PlaceDetailsResponse;

        if (detailsData.status !== 'OK' || !detailsData.result) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: `Could not fetch details for place ID ${placeId}.`,
                    details: `${detailsData.status} - ${detailsData.error_message || 'No result found'}`
                })
            };
        }

        const result = detailsData.result;
        const photoUrls = (result.photos || []).slice(0, 10).map((p: any) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${mapsApiKey}`
        );

        const responseData = {
            name: result.name,
            rating: result.rating,
            photoUrls
        };

        return { statusCode: 200, headers, body: JSON.stringify({ data: responseData }) };

    } catch (error: any) {
        console.error('Error in maps-proxy function:', error);

        if (error.message === "External API timeout") {
            return {
                statusCode: 200, // Return 200 to avoid 502
                headers,
                body: JSON.stringify({ error: "Google Maps API request timed out." })
            };
        }

        return {
            statusCode: 200, // Return 200 to avoid 502
            headers,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.', details: error.stack })
        };
    } finally {
        clearTimeout(timeoutId);
    }
};