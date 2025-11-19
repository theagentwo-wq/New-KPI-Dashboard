// FIX: Add Node.js types reference to resolve Buffer and stream errors.
/// <reference types="node" />

import { GoogleGenAI, Type } from "@google/genai";
import fetch from 'node-fetch';

// Helper to convert stream to buffer, needed for fetching file content
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

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
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in the environment.");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY is missing." }),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { action, payload } = JSON.parse(event.body || '{}');

    const kpiProperties = {
        "Sales": { type: Type.NUMBER },
        "SOP": { type: Type.NUMBER, description: "Store Operating Profit as a percentage (e.g., 18.5 for 18.5%)" },
        "Prime Cost": { type: Type.NUMBER, description: "As a percentage (e.g., 55.2 for 55.2%)" },
        "Avg. Reviews": { type: Type.NUMBER },
        "Food Cost": { type: Type.NUMBER, description: "As a percentage (e.g., 22.1 for 22.1%)" },
        "Variable Labor": { type: Type.NUMBER, description: "As a percentage (e.g., 15.8 for 15.8%)" },
        "Culinary Audit Score": { type: Type.NUMBER, description: "As a percentage (e.g., 95 for 95%)" },
    };

    const actualsDataSchema = {
        type: Type.OBJECT,
        properties: {
            "Store Name": { type: Type.STRING },
            "Week Start Date": { type: Type.STRING, description: "The starting date of the week in YYYY-MM-DD format." },
            ...kpiProperties
        },
        required: ["Store Name", "Week Start Date"]
    };

    const budgetDataSchema = {
        type: Type.OBJECT,
        properties: {
            "Store Name": { type: Type.STRING },
            "Year": { type: Type.NUMBER, description: "The fiscal year (e.g., 2025)"},
            "Month": { type: Type.NUMBER, description: "The fiscal month number (1-12)"},
            ...kpiProperties
        },
        required: ["Store Name", "Year", "Month"]
    };
    
    const universalPrompt = `You are an expert financial analyst for a restaurant group. Analyze the provided document.
    
    **CRITICAL INSTRUCTIONS:**
    1.  **CLASSIFY DATA TYPE:** First, determine if the data represents 'Actuals' (historical, weekly performance data) or a 'Budget' (a forward-looking plan with monthly targets). Your primary clue is the time granularity (weekly vs. monthly) and keywords like "Budget", "Plan", "Actuals", "Report".
    2.  **EXTRACT DATA:** Based on the classification, extract all relevant financial data.
        *   **If 'Actuals':** Extract the 'Store Name', 'Week Start Date' (calculate if a 'Week Ending' date is given, assuming weeks start on Monday), and all KPI values for each row.
        *   **If 'Budget':** Extract the 'Store Name', 'Year', 'Month', and all target KPI values.
    3.  **HANDLE COMPLEX FILES:** The document may contain data for multiple stores and multiple time periods (e.g., a multi-year budget). Process all of them. Ignore any summary rows like "Total" or "Grand Total".
    4.  **FORMAT OUTPUT:** Return a JSON object with two fields: 'dataType' (either "Actuals" or "Budget") and 'data' (an array of JSON objects strictly following the correct schema for that data type). Ensure all percentages are returned as numbers (e.g., 18.5% becomes 18.5).`;
    
    const universalSchema = {
        type: Type.OBJECT,
        properties: {
            dataType: { type: Type.STRING, enum: ["Actuals", "Budget"] },
            data: {
                type: Type.ARRAY,
                items: {
                    oneOf: [actualsDataSchema, budgetDataSchema]
                }
            }
        },
        required: ["dataType", "data"]
    };

    switch (action) {
      case 'extractKpisFromDocument': {
        const { fileUrl, mimeType, fileName } = payload;
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`Failed to download file from URL: ${fileUrl}`);
        
        const buffer = await streamToBuffer(fileResponse.body as NodeJS.ReadableStream);
        const base64Data = buffer.toString('base64');
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: `${universalPrompt}\n\nThe filename is "${fileName}".` },
                { inlineData: { mimeType: mimeType, data: base64Data } }
            ],
            config: { responseMimeType: "application/json", responseSchema: universalSchema },
        });
        
        const parsedResponse = JSON.parse(response.text!);
        return { statusCode: 200, headers, body: JSON.stringify(parsedResponse) };
      }

      case 'extractKpisFromText': {
        const { fileUrl } = payload;
        const textResponse = await fetch(fileUrl);
        if(!textResponse.ok) throw new Error(`Failed to download text from URL: ${fileUrl}`);
        const text = await textResponse.text();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${universalPrompt}\n\n**Text to Analyze:**\n---\n${text}\n---`,
            config: { responseMimeType: "application/json", responseSchema: universalSchema },
        });
        
        const parsedResponse = JSON.parse(response.text!);
        return { statusCode: 200, headers, body: JSON.stringify(parsedResponse) };
      }
      
      case 'getPlaceDetails': {
        if (!process.env.MAPS_API_KEY) {
             return { statusCode: 500, headers, body: JSON.stringify({ error: "Server configuration error: MAPS_API_KEY is missing." }) };
        }
        const mapsApiKey = process.env.MAPS_API_KEY;
        const { address } = payload;
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`Tupelo Honey Southern Kitchen & Bar, ${address}`)}&inputtype=textquery&fields=place_id&key=${mapsApiKey}`;
        
        const findPlaceResponse = await fetch(findPlaceUrl);
        if (!findPlaceResponse.ok) throw new Error(`Google Maps Find Place API failed with status ${findPlaceResponse.status}`);
        
        const findPlaceData = await findPlaceResponse.json() as FindPlaceResponse;

        if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not find a Google Maps location for "${address}". Details: ${findPlaceData.status} - ${findPlaceData.error_message || 'No candidates found'}` }) };
        }
        const placeId = findPlaceData.candidates[0].place_id;

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,photos&key=${mapsApiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) throw new Error(`Google Maps Details API failed with status ${detailsResponse.status}`);
        
        const detailsData = await detailsResponse.json() as PlaceDetailsResponse;

        if (detailsData.status !== 'OK' || !detailsData.result) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not fetch details. Details: ${detailsData.status} - ${detailsData.error_message || 'No result found'}` }) };
        }
        const result = detailsData.result;
        const photoUrls = (result.photos || []).slice(0, 10).map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${mapsApiKey}`);
        return { statusCode: 200, headers, body: JSON.stringify({ data: { name: result.name, rating: result.rating, photoUrls } }) };
    }

      default:
        const { data, view, periodLabel } = payload;
        const prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Cafe for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs) highlighting the most significant wins, challenges, and key areas for focus. The data represents director-level aggregates. Your analysis should be sharp, insightful, and tailored for an executive audience. Data:\n${JSON.stringify(data, null, 2)}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
    }
  } catch (error: any) {
    console.error('Error in Gemini proxy:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};