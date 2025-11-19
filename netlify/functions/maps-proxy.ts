// netlify/functions/maps-proxy.ts

import fetch from 'node-fetch';

// Type definitions for Google Maps API responses to ensure type safety
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

    try {
        const { address } = JSON.parse(event.body || '{}');
        if (!address) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'address' in request payload." }) };
        }

        // Step 1: Find the Place ID from the address text.
        // We include the business name for higher accuracy.
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`Tupelo Honey Southern Kitchen & Bar, ${address}`)}&inputtype=textquery&fields=place_id&key=${mapsApiKey}`;
        
        const findPlaceResponse = await fetch(findPlaceUrl);
        if (!findPlaceResponse.ok) {
            throw new Error(`Google Maps Find Place API failed with status ${findPlaceResponse.status}`);
        }
        
        const findPlaceData = await findPlaceResponse.json() as FindPlaceResponse;

        if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
            const errorBody = { 
                error: `Could not find a Google Maps location for "${address}".`,
                details: `${findPlaceData.status} - ${findPlaceData.error_message || 'No candidates found'}`
            };
            return { statusCode: 404, headers, body: JSON.stringify(errorBody) };
        }
        const placeId = findPlaceData.candidates[0].place_id;

        // Step 2: Use the Place ID to get detailed information.
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,photos&key=${mapsApiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
            throw new Error(`Google Maps Details API failed with status ${detailsResponse.status}`);
        }
        
        const detailsData = await detailsResponse.json() as PlaceDetailsResponse;

        if (detailsData.status !== 'OK' || !detailsData.result) {
             const errorBody = { 
                error: `Could not fetch details for place ID ${placeId}.`,
                details: `${detailsData.status} - ${detailsData.error_message || 'No result found'}`
            };
            return { statusCode: 404, headers, body: JSON.stringify(errorBody) };
        }
        
        const result = detailsData.result;
        // Construct full photo URLs, limiting to the first 10 for performance.
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
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};
