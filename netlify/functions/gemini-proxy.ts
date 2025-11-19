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

    switch (action) {
      case 'getAIAssistedMapping': {
        const { headers: csvHeaders, kpis: appKpis, preHeaderContent } = payload;
        const prompt = `You are an intelligent data mapping assistant for a multi-unit restaurant group. Your goal is to map spreadsheet headers to the application's fields and identify a file-wide date if present.

**Application Fields:** ${appKpis.join(', ')}
**Spreadsheet Headers:** ${csvHeaders.join(', ')}
**File Content (first few rows):**
---
${preHeaderContent || "No pre-header content provided."}
---

**CRITICAL INSTRUCTIONS (Follow in order):**

**Step 1: Find the Date (Two-Step Process)**
   a. **Analyze Pre-Header Content First:** Scrutinize the "File Content" provided above. Look for a single, clear date reference like "For the Week Ending 01/07/2025" or "P1 Wk4 2025". If you find ONE unambiguous date that applies to the entire file, extract it and set it as 'fileWideDate' in 'YYYY-MM-DD' format.
   b. **Analyze Headers (Fallback):** If and ONLY IF you did not find a file-wide date in Step 1a, search the "Spreadsheet Headers" for a date column (e.g., "Week Start Date", "Date"). If found, map it to "Week Start Date".
   c. If you cannot find a date by either method, do not map any date field.

**Step 2: Map Other Columns**
1.  **Store Name:** Search the headers for "Store Name", "Location", "Restaurant", "Unit". If found, map it to "Store Name".
2.  **KPIs:** Map the remaining headers to the best match from the Application Fields list.
3.  **No Match:** If a header has no clear match, you MUST map it to "ignore".

Your response MUST be a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mappings: { type: Type.OBJECT },
                        fileWideDate: { type: Type.STRING, description: "A single date (YYYY-MM-DD) if found in the pre-header content." }
                    },
                    required: ["mappings"]
                },
            },
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
        // Keep other cases like getExecutiveSummary etc.
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