import { GoogleGenAI, Type } from "@google/genai";

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

    // Define the schema once, as it's shared by both new actions.
    const kpiDataSchema = {
      type: Type.OBJECT,
      properties: {
        "Store Name": { type: Type.STRING },
        "Week Start Date": { type: Type.STRING, description: "The starting date of the week in YYYY-MM-DD format." },
        "Sales": { type: Type.NUMBER },
        "SOP": { type: Type.NUMBER, description: "Store Operating Profit as a percentage (e.g., 18.5 for 18.5%)" },
        "Prime Cost": { type: Type.NUMBER, description: "As a percentage (e.g., 55.2 for 55.2%)" },
        "Avg. Reviews": { type: Type.NUMBER },
        "Food Cost": { type: Type.NUMBER, description: "As a percentage (e.g., 22.1 for 22.1%)" },
        "Variable Labor": { type: Type.NUMBER, description: "As a percentage (e.g., 15.8 for 15.8%)" },
        "Culinary Audit Score": { type: Type.NUMBER, description: "As a percentage (e.g., 95 for 95%)" },
      },
      required: ["Store Name", "Week Start Date"]
    };

    switch (action) {
      case 'extractKpisFromDocument': {
        const { fileData, fileName } = payload;
        const prompt = `You are an expert financial analyst for a restaurant group. Analyze the provided document (image or spreadsheet) with the filename "${fileName}".
        
        **CRITICAL INSTRUCTIONS:**
        1.  **Analyze Holistically:** Read the entire document to understand its context. The date and store name might be in the title, headers, or columns.
        2.  **Find Date:** Identify the correct week start date for the data. If a "week ending" date is given, calculate the corresponding week start date (assuming weeks start on Monday).
        3.  **Extract Data:** Identify all rows of financial data. For each row, extract all available Key Performance Indicators (KPIs).
        4.  **Handle Multi-Store Files:** If the document contains data for multiple stores in different rows or sections, create a separate JSON object for each store's data row.
        5.  **Handle Single-Store Files:** If the document contains data for only one store (which might be identified in the filename or a title), apply that single store name to all data rows.
        6.  **Format Output:** Return an array of JSON objects, where each object represents one row of data and strictly follows the provided schema. Ensure all percentages are returned as numbers (e.g., 18.5% becomes 18.5).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                { inlineData: { mimeType: fileData.mimeType, data: fileData.data } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      data: {
                        type: Type.ARRAY,
                        items: kpiDataSchema
                      }
                    }
                },
            },
        });
        
        const parsedResponse = JSON.parse(response.text!);
        return { statusCode: 200, headers, body: JSON.stringify(parsedResponse) };
      }

      case 'extractKpisFromText': {
        const { text } = payload;
        const prompt = `You are an expert financial analyst. Analyze the following block of unstructured text, which is likely copied from an email or document. 
        
        **CRITICAL INSTRUCTIONS:**
        1.  **Find Context:** Read the entire text to find the store name(s) and the relevant week start date.
        2.  **Extract KPIs:** For each store mentioned, extract all available Key Performance Indicator (KPI) values.
        3.  **Structure Data:** Format the extracted information into an array of JSON objects, strictly following the provided schema.

        **Text to Analyze:**
        ---
        ${text}
        ---`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      data: {
                        type: Type.ARRAY,
                        items: kpiDataSchema
                      }
                    }
                },
            },
        });
        
        const parsedResponse = JSON.parse(response.text!);
        return { statusCode: 200, headers, body: JSON.stringify(parsedResponse) };
      }
      
      case 'getPlaceDetails': {
        // This case remains unchanged, but is included for completeness.
        if (!process.env.MAPS_API_KEY) {
             return { statusCode: 500, headers, body: JSON.stringify({ error: "Server configuration error: MAPS_API_KEY is missing." }) };
        }
        const mapsApiKey = process.env.MAPS_API_KEY;
        const { address } = payload;
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`Tupelo Honey Southern Kitchen & Bar, ${address}`)}&inputtype=textquery&fields=place_id&key=${mapsApiKey}`;
        const findPlaceResponse = await fetch(findPlaceUrl);
        if (!findPlaceResponse.ok) throw new Error(`Google Maps Find Place API failed with status ${findPlaceResponse.status}`);
        const findPlaceData = await findPlaceResponse.json();
        if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not find a Google Maps location for "${address}". Details: ${findPlaceData.status}` }) };
        }
        const placeId = findPlaceData.candidates[0].place_id;

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,photos&key=${mapsApiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) throw new Error(`Google Maps Details API failed with status ${detailsResponse.status}`);
        const detailsData = await detailsResponse.json();
        if (detailsData.status !== 'OK') {
            return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not fetch details. Details: ${detailsData.status}` }) };
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