import { GoogleGenAI, Type } from "@google/genai";
import { Note } from '../../types';

export const handler = async (event: { httpMethod: string; body?: string }) => {
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

    try {
        const { action, payload } = JSON.parse(event.body || '{}');
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const mapsApiKey = process.env.MAPS_API_KEY;
        const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

        const throwApiError = (service: 'AI' | 'Maps', reason: string) => {
            const keyName = service === 'AI' ? 'GEMINI_API_KEY' : 'MAPS_API_KEY';
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: `${service} Service Error: ${reason}. Please check that the ${keyName} is configured correctly.` })
            };
        };

        switch (action) {
            case 'getExecutiveSummary': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { data, view, periodLabel } = payload;
                const prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Cafe for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs) highlighting the most significant wins, challenges, and key areas for focus. The data represents director-level aggregates. Your analysis should be sharp, insightful, and tailored for an executive audience. Data:\n${JSON.stringify(data, null, 2)}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }

            case 'getNoteTrends': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { notes }: { notes: Note[] } = payload;
                const notesContent = notes.map(n => `[${n.category} on ${new Date(n.createdAt).toLocaleDateString()}]: ${n.content}`).join('\n');
                const prompt = `As a restaurant operations analyst, analyze the following operational notes. Identify the top 2-3 recurring themes or most critical issues. For each theme, provide a brief summary and suggest a potential action. The notes are:\n\n${notesContent}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }

            case 'extractKpisFromImage':
            case 'extractKpisFromDocument': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { fileData, mimeType, context } = payload;
                if (!fileData || !mimeType) return { statusCode: 400, headers, body: JSON.stringify({ error: "fileData and mimeType are required." }) };

                const prompt = `You are an expert financial data analyst. Your task is to extract key performance indicators (KPIs) from a financial tracking document. Analyze the file carefully. Identify the store name and the data for each week shown.

**KPIs to Extract (and their required JSON key):**
- "Total Net Sales" -> "Sales"
- "Store Operating Profit" or "SOP w/ Store Other Expense Budget Mix" -> "SOP"
- "Prime Cost" (% of Sales) -> "Prime Cost"
- "Total COGS" (% of Sales) -> "Food Cost"
- "Total Variable Labor Expenses" (% of Sales) -> "Variable Labor"

**Instructions:**
1. Identify the Store Name.
2. For EACH weekly "Actual" column you find, extract the values for the KPIs.
3. The date should be in YYYY-MM-DD format. Assume the year from the context.
4. Your output MUST be a valid JSON array of objects, one for each store-week combination.
5. All percentage values must be returned as plain numbers (e.g., "21.6%" -> 21.6). All currency values must be numbers.

**Context:**
- ${context}`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: { parts: [{ text: prompt }, { inlineData: { data: fileData, mimeType } }] },
                  config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          storeName: { type: Type.STRING },
                          weekStartDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                          Sales: { type: Type.NUMBER },
                          SOP: { type: Type.NUMBER },
                          'Prime Cost': { type: Type.NUMBER },
                          'Food Cost': { type: Type.NUMBER },
                          'Variable Labor': { type: Type.NUMBER },
                        },
                        required: ["storeName", "weekStartDate", "Sales", "SOP", "Prime Cost", "Food Cost", "Variable Labor"],
                      },
                    },
                  },
                });

                return { statusCode: 200, headers, body: JSON.stringify({ data: JSON.parse(response.text) }) };
            }

            case 'getAIAssistedMapping': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { headers: csvHeaders, kpis: appKpis } = payload;
                const prompt = `You are an intelligent data mapping assistant. Map the user's CSV headers to the application's predefined KPIs.

                **Application KPIs:** ${appKpis.join(', ')}
                **CSV Headers:** ${csvHeaders.join(', ')}

                **Instructions:**
                - For each CSV header, find the best match from the Application KPIs.
                - If a header is for the store location, map it to "Store Name".
                - If it's a date, map to "Week Start Date".
                - If there is no clear match, you MUST map it to "ignore".
                - Your response MUST be a valid JSON object where keys are the original CSV headers and values are the mapped KPIs.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                mappings: { type: Type.OBJECT }
                            }
                        },
                    },
                });
                
                const parsedResponse = JSON.parse(response.text);
                return { statusCode: 200, headers, body: JSON.stringify({ mappings: parsedResponse.mappings || {} }) };
            }

            case 'getPlaceDetails': {
                if (!mapsApiKey) return throwApiError('Maps', 'API key is not configured');
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
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
    } catch (error: any) {
        console.error('Error in Gemini proxy:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};