// FIX: Resolve Buffer and stream errors for environments where Node.js types are not available to TypeScript.
import { GoogleGenAI, Type } from "@google/genai";
import fetch from 'node-fetch';
// FIX: The invalid import 'netlify-functions-ts' has been removed.
import { createAnalysisJob } from '../../services/firebaseService';

// FIX: Declare Buffer as a global type to resolve TypeScript errors.
declare var Buffer: any;

// Helper to convert stream to buffer, needed for fetching file content
// FIX: Use `any` for stream types to avoid dependency on Node.js type definitions.
async function streamToBuffer(stream: any): Promise<any> {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', (err: any) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export const handler = async (event: any, _context: any) => {
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
    1.  **DETECT DYNAMIC SHEETS:** First, examine the structure of the document. If you see text indicating a dropdown menu, a filter control, or instructions to select a store/entity to view its data, set the 'isDynamicSheet' flag to true. This is crucial. If it's just a static table of data for one or more entities without interactive elements, set 'isDynamicSheet' to false.
    2.  **CLASSIFY DATA TYPE:** Next, determine if the data represents 'Actuals' (historical, weekly performance data) or a 'Budget' (a forward-looking plan with monthly targets). Your primary clue is the time granularity (weekly vs. monthly) and keywords like "Budget", "Plan", "Actuals", "Report".
    3.  **EXTRACT DATA:** Based on the classification, extract all relevant financial data. If 'isDynamicSheet' is true, extract data for the currently visible store only.
        *   **If 'Actuals':** Extract the 'Store Name', 'Week Start Date' (calculate if a 'Week Ending' date is given, assuming weeks start on Monday), and all KPI values for each row.
        *   **If 'Budget':** Extract the 'Store Name', 'Year', 'Month', and all target KPI values.
    4.  **HANDLE COMPLEX FILES:** The document may contain data for multiple stores and multiple time periods (e.g., a multi-year budget). Process all of them. Ignore any summary rows like "Total" or "Grand Total".
    5.  **FORMAT OUTPUT:** Return a JSON object with two fields: 'dataType' (either "Actuals" or "Budget") and 'data' (an array of JSON objects strictly following the correct schema for that data type). Ensure all percentages are returned as numbers (e.g., 18.5% becomes 18.5).`;
    
    const universalSchema = {
        type: Type.OBJECT,
        properties: {
            isDynamicSheet: { 
                type: Type.BOOLEAN, 
                description: "Set to true if the analyzed sheet contains interactive UI elements like a dropdown menu or filter that changes the data displayed (e.g., selecting a different store). Set to false if it's a static data table."
            },
            dataType: { type: Type.STRING, enum: ["Actuals", "Budget"] },
            data: {
                type: Type.ARRAY,
                items: {
                    oneOf: [actualsDataSchema, budgetDataSchema]
                }
            }
        },
        required: ["dataType", "data", "isDynamicSheet"]
    };

    switch (action) {
      case 'startStrategicAnalysis': {
        const jobId = await createAnalysisJob(payload);
        
        // FIX: Replaced the non-existent 'netlify.functions.invoke' with a standard fetch call
        // to reliably trigger the background function.
        const origin = new URL(event.rawUrl).origin;
        const functionUrl = `${origin}/.netlify/functions/process-analysis-job`;

        fetch(functionUrl, {
            method: 'POST',
            body: JSON.stringify({ payload: { jobId } })
        }).catch(err => {
            console.error("Error invoking background function 'process-analysis-job':", err);
        });

        // Immediately return the jobId to the client
        return { statusCode: 200, headers, body: JSON.stringify({ jobId }) };
      }
      
      case 'extractKpisFromDocument': {
        const { fileUrl, mimeType, fileName } = payload;
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`Failed to download file from URL: ${fileUrl}`);
        
        const buffer = await streamToBuffer(fileResponse.body);
        const base64Data = buffer.toString('base64');
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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
            model: 'gemini-3-pro-preview',
            contents: `${universalPrompt}\n\n**Text to Analyze:**\n---\n${text}\n---`,
            config: { responseMimeType: "application/json", responseSchema: universalSchema },
        });
        
        const parsedResponse = JSON.parse(response.text!);
        return { statusCode: 200, headers, body: JSON.stringify(parsedResponse) };
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