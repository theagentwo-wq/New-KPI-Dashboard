import { GoogleGenAI, Type, FunctionDeclaration, Part } from "@google/genai";
import { Kpi, PerformanceData, View, ForecastDataPoint, DailyForecast, Note } from '../../types';
import { KPI_CONFIG } from '../../constants';

// --- Helper Functions (moved from original service) ---

const AI_CONTEXT = "You are an expert restaurant operations analyst for Tupelo Honey Cafe, a southern restaurant chain (website: https://tupelohoneycafe.com). Your analysis should be sharp, insightful, and tailored to a restaurant executive audience.";

// This function is no longer used for detailed analysis but kept for simple contexts
const formatDataForAI = (data: any, view: View, kpi: Kpi | 'All'): string => {
  if (!data) return "No data available.";
  let csvString = `Location,${Object.values(Kpi).join(',')}\n`;

  if (view === 'Total Company') {
    Object.keys(data).forEach(director => {
      if(data[director] && data[director].aggregated){
        const row = [director];
        Object.values(Kpi).forEach(k => {
          row.push(data[director].aggregated[k]?.toFixed(4) || '0');
        });
        csvString += row.join(',') + '\n';
      }
    });
  } else {
    Object.keys(data).forEach(storeId => {
      if(data[storeId] && data[storeId].actual){
        const row = [storeId];
        Object.values(Kpi).forEach(k => {
          row.push(data[storeId].actual[k]?.toFixed(4) || '0');
        });
        csvString += row.join(',') + '\n';
      }
    });
  }
  return `Context: Restaurant Operations KPI Data. View: ${view}. Focused KPI: ${kpi}.\n\n${csvString}`;
};

const formatHistoricalDataForAI = (historicalData: { periodLabel: string; data: PerformanceData }[], view: View): string => {
  if (!historicalData || historicalData.length === 0) return "No historical data available.";
  
  const headers = ['Period', ...Object.values(Kpi)].join(',');
  const rows = historicalData.map(entry => {
    const rowData = [entry.periodLabel];
    Object.values(Kpi).forEach(kpi => {
      rowData.push(entry.data[kpi]?.toFixed(4) || '0');
    });
    return rowData.join(',');
  });

  return `Context: Historical Restaurant Operations KPI Data. View: ${view}.\n\n${headers}\n${rows.join('\n')}`;
};

const parseScenarioFunctionDeclaration: FunctionDeclaration = {
  name: 'parseScenario',
  description: 'Parses a user query about a business scenario to extract key parameters for modeling.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      kpi: { 
        type: Type.STRING, 
        description: 'The Key Performance Indicator being changed.',
        enum: Object.values(Kpi) 
      },
      changeValue: { 
        type: Type.NUMBER, 
        description: 'The amount of change. E.g., for a 0.5% drop, this would be -0.5.' 
      },
      changeUnit: {
        type: Type.STRING,
        description: 'The unit of change.',
        enum: ['percent', 'absolute']
      },
      scope: {
        type: Type.STRING,
        description: `The scope of the change. E.g., "Heather's region", "Total Company", "Denver, CO".`
      },
      targetKpi: {
        type: Type.STRING,
        description: 'The KPI to analyze the impact on. E.g., "SOP".',
        enum: Object.values(Kpi)
      }
    },
    required: ['kpi', 'changeValue', 'changeUnit', 'scope'],
  },
};


// --- Netlify Handler ---

export const handler = async (event: { httpMethod: string; body?: string }) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
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
                body: JSON.stringify({ error: `${service} Service Error: ${reason}. Please check that the ${keyName} is configured correctly in your Netlify site settings.` }) 
            };
        }

        const kpiExtractionSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              storeName: { type: Type.STRING },
              weekStartDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
              Sales: { type: Type.NUMBER, description: "Total Net Sales as a number, no commas or symbols" },
              SOP: { type: Type.NUMBER, description: "Store Operating Profit as a percentage, e.g., 23.6" },
              'Prime Cost': { type: Type.NUMBER, description: "Prime Cost as a percentage" },
              'Food Cost': { type: Type.NUMBER, description: "Total COGS as a percentage" },
              'Variable Labor': { type: Type.NUMBER, description: "Total Variable Labor Expenses as a percentage" },
            },
            required: ["storeName", "weekStartDate", "Sales", "SOP", "Prime Cost", "Food Cost", "Variable Labor"],
          },
        };

        switch (action) {
             case 'extractKpisFromImage':
             case 'extractKpisFromDocument': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { fileData, mimeType, context } = payload;
                if (!fileData || !mimeType) return { statusCode: 400, headers, body: JSON.stringify({ error: "fileData and mimeType are required." }) };
                
                const filePart: Part = { inlineData: { data: fileData, mimeType } };

                const prompt = `You are an expert financial data analyst. Your task is to extract key performance indicators (KPIs) from an image or document of a weekly financial tracking spreadsheet. Analyze the file carefully. Identify the store name and the data for each week shown.

**KPIs to Extract (and their required JSON key):**
- "Total Net Sales" -> "Sales"
- "Store Operating Profit" or "SOP w/ Store Other Expense Budget Mix" -> "SOP"
- "Prime Cost" (as a percentage of sales) -> "Prime Cost"
- "Total COGS" (as a percentage of sales, often highlighted) -> "Food Cost"
- "Total Variable Labor Expenses" (as a percentage of sales) -> "Variable Labor"

**Instructions:**
1.  Identify the Store Name from the file (e.g., "01 - Asheville Downtown").
2.  For EACH weekly "Actual" column you find (e.g., "Actual 10/05/25", "Actual 10/12/25"), extract the values for the KPIs listed above.
3.  The date should be in YYYY-MM-DD format. Assume the year from the context provided.
4.  Your output MUST be a valid JSON array of objects, where each object represents one store for one week. Adhere strictly to the provided JSON schema.
5.  All percentage values must be returned as plain numbers (e.g., "21.6%" should be 21.6). All currency values must be returned as plain numbers without symbols or commas.

**Context:**
- ${context}`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: { parts: [ {text: prompt}, filePart ]},
                  config: { responseMimeType: "application/json", responseSchema: kpiExtractionSchema },
                });
                
                const jsonString = response.text?.trim();
                const data = jsonString ? JSON.parse(jsonString) : [];
                
                return { statusCode: 200, headers, body: JSON.stringify({ data }) };
            }

            case 'getAIAssistedMapping': {
                if (!ai) return throwApiError('AI', 'Service is not initialized');
                const { headers: csvHeaders, kpis: appKpis } = payload;
                if (!csvHeaders || !appKpis) return { statusCode: 400, headers, body: JSON.stringify({ error: "CSV headers and app KPIs are required." }) };

                const prompt = `You are an intelligent data mapping assistant for a restaurant KPI dashboard. Your task is to map the columns from a user's uploaded CSV file to the application's predefined set of KPIs.

                Analyze the provided CSV headers and, for each header, determine which of the application's KPIs it corresponds to. Use your knowledge of business and financial terms to make the best match.

                **Application's Predefined KPIs:**
                ${appKpis.join(', ')}

                **CSV Headers to Map:**
                ${csvHeaders.join(', ')}

                **Instructions:**
                - For each CSV header, find the single best match from the Application's KPIs.
                - If a header is clearly for identifying the store location (e.g., "Location", "Store", "Restaurant Name"), map it to "Store Name".
                - If a header is clearly for the date, map it to "Week Start Date".
                - If a header does not match any of the KPIs or is irrelevant (e.g., "YOY Comp Traffic", internal codes), you MUST map it to "ignore".
                - Your response MUST be a valid JSON object containing a single key "mappings", which is an array of objects. Each object in the array must have two keys: "header" (the original CSV header) and "mappedKpi" (your suggested mapping).`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                mappings: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            header: { type: Type.STRING },
                                            mappedKpi: { type: Type.STRING },
                                        },
                                        required: ["header", "mappedKpi"],
                                    },
                                },
                            },
                        },
                    },
                });

                const jsonString = response.text?.trim();
                const parsedResponse = jsonString ? JSON.parse(jsonString) : { mappings: [] };

                const mappingsObject = (parsedResponse.mappings || []).reduce((acc: any, item: any) => {
                    acc[item.header] = item.mappedKpi;
                    return acc;
                }, {});

                return { statusCode: 200, headers, body: JSON.stringify({ mappings: mappingsObject }) };
            }
            case 'getPlaceDetails': {
                if (!mapsApiKey) return throwApiError('Maps', 'API key is not configured');
                
                const { address } = payload;
                if (!address) return { statusCode: 400, headers, body: JSON.stringify({ error: "Address is required."}) };
                
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
                    return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not fetch details for place. Details: ${detailsData.status}` }) };
                }
                
                const result = detailsData.result;
                const photoUrls = (result.photos || []).slice(0, 10).map((photo: any) => 
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${mapsApiKey}`
                );

                const data = { name: result.name, rating: result.rating, photoUrls };
                return { statusCode: 200, headers, body: JSON.stringify({ data }) };
            }
            
            // --- Other Gemini cases... (omitted for brevity but would be here) ---
            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
    } catch (error: any) {
        console.error('Error in Gemini proxy:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};