import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Kpi, PerformanceData, View, ForecastDataPoint } from '../../types';

// This function runs on Netlify's backend.
// The API key is securely accessed from environment variables and never exposed to the client.
const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

// --- Helper Functions (moved from original service) ---

const AI_CONTEXT = "You are an expert restaurant operations analyst for Tupelo Honey Cafe, a southern restaurant chain (website: https://tupelohoneycafe.com). Your analysis should be sharp, insightful, and tailored to a restaurant executive audience.";

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
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { action, payload } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'getExecutiveSummary': {
                const { data, view, periodLabel } = payload;
                const formattedData = formatDataForAI(data, view, 'All');
                const prompt = `${AI_CONTEXT} Based on the following data for ${periodLabel}, provide a concise 2-3 sentence executive summary of the performance for ${view}. Highlight the most significant win and the biggest area for improvement. Data:\n${formattedData}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, body: JSON.stringify({ content: response.text }) };
            }

            case 'getInsights': {
                const { data, view, periodLabel, query, userLocation } = payload;
                const formattedData = formatDataForAI(data, view, 'All');
                const prompt = `${AI_CONTEXT} The user is looking at data for ${periodLabel} for the view "${view}". Answer their question based on the data provided. If relevant, use your tools to incorporate real-world geographic information.\n\nData:\n${formattedData}\n\nQuestion: ${query}`;

                const modelConfig: any = {};
                if (userLocation) {
                    modelConfig.tools = [{ googleMaps: {} }];
                    modelConfig.toolConfig = { retrievalConfig: { latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude }}};
                }
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: modelConfig });
                let content = response.text || "I'm sorry, I couldn't process that request.";

                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks?.length) {
                    const sources = new Set<string>();
                    groundingChunks.forEach((chunk: any) => {
                        if (chunk.maps?.uri) sources.add(`[${chunk.maps.title || 'Google Maps Location'}](${chunk.maps.uri})`);
                        chunk.maps?.placeAnswerSources?.reviewSnippets?.forEach((snippet: any) => { if (snippet.uri) sources.add(`[Review Snippet](${snippet.uri})`); });
                    });
                    if (sources.size > 0) content += "\n\n**Sources:**\n" + Array.from(sources).map(s => `- ${s}`).join('\n');
                }
                return { statusCode: 200, body: JSON.stringify({ content }) };
            }

            case 'getTrendAnalysis': {
                const { historicalData, view } = payload;
                const formattedData = formatHistoricalDataForAI(historicalData, view);
                const prompt = `${AI_CONTEXT} Based on the following historical data for "${view}", analyze the trends for the key KPIs over these periods. Identify 1-2 of the most significant positive or negative trends. Explain what the trend is (e.g., "Food Cost is consistently increasing") and briefly suggest a potential implication. Present the analysis in a clear, bulleted list.\n\nData:\n${formattedData}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, body: JSON.stringify({ content: response.text }) };
            }

            case 'getDirectorPerformanceSnapshot': {
                 const { directorName, periodLabel, directorData } = payload;
                 const formattedData = Object.entries(directorData).map(([kpi, value]) => `${kpi}: ${(value as number).toFixed(4)}`).join('\n');
                 const prompt = `${AI_CONTEXT}\nBased on the aggregated performance data for director ${directorName}'s region for the period "${periodLabel}", provide a concise performance snapshot. Format the response using markdown with these exact three headers: ### 🏆 Key Win, ### 📉 Key Challenge, and ### 🎯 Strategic Focus. For the "Key Win", identify the top-performing KPI and briefly explain its positive impact. For the "Key Challenge", identify the most significant underperforming KPI and its negative impact. For the "Strategic Focus", provide a single, clear, actionable recommendation based on restaurant industry best practices to improve the key challenge.\n\nData:\n${formattedData}`;
                 const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                 return { statusCode: 200, body: JSON.stringify({ content: response.text }) };
            }

            case 'getAnomalyDetections': {
                const { allStoresData, periodLabel } = payload;
                const dataForAnomalies = Object.entries(allStoresData).map(([location, data]: [string, any]) => ({ location, ...data.actual }));
                const prompt = `${AI_CONTEXT} You are a data scientist. Analyze the following performance data for all stores for the period "${periodLabel}". Identify up to 3 of the most statistically significant anomalies (either positive or negative). For each anomaly, provide a concise one-sentence summary and a brief root cause analysis.\n\nData:\n${JSON.stringify(dataForAnomalies, null, 2)}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { location: { type: Type.STRING }, kpi: { type: Type.STRING }, deviation: { type: Type.NUMBER }, summary: { type: Type.STRING }, analysis: { type: Type.STRING } }, required: ["location", "kpi", "deviation", "summary", "analysis"] }}
                    }
                });
                const jsonString = response.text?.trim();
                const parsedAnomalies = jsonString ? JSON.parse(jsonString) : [];
                const data = parsedAnomalies.map((item: any, index: number) => ({ ...item, id: `anomaly-${Date.now()}-${index}`, periodLabel }));
                return { statusCode: 200, body: JSON.stringify({ data }) };
            }

            case 'generateHuddleBrief': {
                const { location, storeData } = payload;
                const formattedData = Object.entries(storeData).map(([kpi, value]) => `${kpi}: ${(value as number).toFixed(4)}`).join('\n');
                const prompt = `${AI_CONTEXT} You are an expert restaurant operations coach. Based on the most recent performance data for the ${location} store, generate a concise, motivational pre-shift huddle brief for the store manager. The brief should be under 150 words. Format the response using markdown with these exact three headers: ### 🎯 Goal for Today, ### 🤔 Why it Matters, and ### 🏆 How to Win. Identify the single biggest performance opportunity from the data and make that the focus.\n\nData:\n${formattedData}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, body: JSON.stringify({ content: response.text }) };
            }

            case 'runWhatIfScenario': {
                const { data, userPrompt } = payload;
                const formattedData = formatDataForAI(data, 'Total Company', 'All');
                const prompt = `${AI_CONTEXT}\nYou are an expert financial modeler. Analyze the following "what-if" scenario based on the provided data. First, use the 'parseScenario' tool to extract the parameters from the user's request. Second, provide a concise analysis of the likely impact of this change. Explain your reasoning.\n\nData:\n${formattedData}\n\nScenario: "${userPrompt}"`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ functionDeclarations: [parseScenarioFunctionDeclaration] }] } });
                const analysis = response.text;
                const args = response.functionCalls?.[0]?.args;
                let responseData: any = { analysis: analysis || "Analysis could not be generated.", args };
                if (!analysis && args) {
                    responseData = { analysis: `Scenario parameters successfully parsed. You asked to model a change of ${args.changeValue} ${args.changeUnit} for ${args.kpi} in ${args.scope}.`, args };
                }
                return { statusCode: 200, body: JSON.stringify({ data: responseData }) };
            }

            case 'getSalesForecast': {
                const { location } = payload;
                const prompt = `Based on the historical sales data for the restaurant in ${location}, generate a 7-day sales forecast. Use Google Search to factor in the current weather forecast and any significant local events (festivals, conferences, etc.) that could impact traffic. The response MUST be a JSON array of objects, where each object has "date" (YYYY-MM-DD) and "predictedSales" (number). Output ONLY the JSON array, with no other text, markdown, or explanation.`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
                const text = response.text?.trim();
                let data: ForecastDataPoint[] = [];
                if (text) {
                    const match = /\[[\s\S]*\]/.exec(text);
                    if (match && match[0]) {
                        data = JSON.parse(match[0]);
                    }
                }
                return { statusCode: 200, body: JSON.stringify({ data }) };
            }

            default:
                return { statusCode: 400, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
    } catch (error: any) {
        console.error('Error in Gemini proxy:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};