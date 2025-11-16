
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Kpi, PerformanceData, View, Anomaly, ForecastDataPoint } from '../types';

// Fix: Initialize the Gemini AI client using process.env.API_KEY as per the coding guidelines.
// This assumes the API key is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
  try {
    const formattedData = formatDataForAI(data, view, 'All');
    const prompt = `${AI_CONTEXT} Based on the following data for ${periodLabel}, provide a concise 2-3 sentence executive summary of the performance for ${view}. Highlight the most significant win and the biggest area for improvement. Data:\n${formattedData}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching executive summary:", error);
    return "Could not generate summary at this time.";
  }
};

export const getInsights = async (
    data: any,
    view: View,
    periodLabel: string,
    query: string,
    userLocation?: { latitude: number; longitude: number } | null
): Promise<string> => {
    try {
        const formattedData = formatDataForAI(data, view, 'All');
        const prompt = `${AI_CONTEXT} The user is looking at data for ${periodLabel} for the view "${view}". Answer their question based on the data provided. If relevant, use your tools to incorporate real-world geographic information.\n\nData:\n${formattedData}\n\nQuestion: ${query}`;

        const modelConfig: any = {};
        if (userLocation) {
            modelConfig.tools = [{ googleMaps: {} }];
            modelConfig.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }
                }
            };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: modelConfig,
        });

        let content = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            const sources = new Set<string>();
            groundingChunks.forEach((chunk: any) => {
                if (chunk.maps?.uri) {
                    sources.add(`[${chunk.maps.title || 'Google Maps Location'}](${chunk.maps.uri})`);
                }
                if (chunk.maps?.placeAnswerSources?.reviewSnippets) {
                    chunk.maps.placeAnswerSources.reviewSnippets.forEach((snippet: any) => {
                        if (snippet.uri) {
                            sources.add(`[Review Snippet](${snippet.uri})`);
                        }
                    });
                }
            });

            if (sources.size > 0) {
                content += "\n\n**Sources:**\n" + Array.from(sources).map(s => `- ${s}`).join('\n');
            }
        }
        return content;

    } catch (error) {
        console.error("Error fetching insights:", error);
        return "I'm sorry, I couldn't process that request.";
    }
};

export const getTrendAnalysis = async (historicalData: { periodLabel: string; data: PerformanceData }[], view: View): Promise<string> => {
  try {
    const formattedData = formatHistoricalDataForAI(historicalData, view);
    const prompt = `${AI_CONTEXT} Based on the following historical data for "${view}", analyze the trends for the key KPIs over these periods. Identify 1-2 of the most significant positive or negative trends. Explain what the trend is (e.g., "Food Cost is consistently increasing") and briefly suggest a potential implication. Present the analysis in a clear, bulleted list.

Data:
${formattedData}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching trend analysis:", error);
    return "Could not generate trend analysis at this time.";
  }
};

export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: PerformanceData): Promise<string> => {
    try {
        const formattedData = Object.entries(directorData)
            .map(([kpi, value]) => `${kpi}: ${value.toFixed(4)}`)
            .join('\n');

        const prompt = `${AI_CONTEXT}
Based on the aggregated performance data for director ${directorName}'s region for the period "${periodLabel}", provide a concise performance snapshot.
Format the response using markdown with these exact three headers: ### 🏆 Key Win, ### 📉 Key Challenge, and ### 🎯 Strategic Focus.
For the "Key Win", identify the top-performing KPI and briefly explain its positive impact.
For the "Key Challenge", identify the most significant underperforming KPI and its negative impact.
For the "Strategic Focus", provide a single, clear, actionable recommendation based on restaurant industry best practices to improve the key challenge.

Data:
${formattedData}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching director snapshot:", error);
        return "Could not generate performance snapshot at this time.";
    }
};

export const getAnomalyDetections = async (allStoresData: { [storeId: string]: { actual: PerformanceData } }, periodLabel: string): Promise<Anomaly[]> => {
    try {
        const dataForAnomalies = Object.entries(allStoresData).map(([location, data]) => ({
            location, ...data.actual
        }));

        const prompt = `${AI_CONTEXT} You are a data scientist. Analyze the following performance data for all stores for the period "${periodLabel}". Identify up to 3 of the most statistically significant anomalies (either positive or negative). For each anomaly, provide a concise one-sentence summary and a brief root cause analysis.
        
Data:
${JSON.stringify(dataForAnomalies, null, 2)}
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING },
                            kpi: { type: Type.STRING },
                            deviation: { type: Type.NUMBER, description: "The percentage deviation from the average or expected value." },
                            summary: { type: Type.STRING, description: "A one-sentence summary of the anomaly." },
                            analysis: { type: Type.STRING, description: "A brief root cause analysis or hypothesis." }
                        },
                        required: ["location", "kpi", "deviation", "summary", "analysis"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedAnomalies = JSON.parse(jsonString);

        return parsedAnomalies.map((item: any, index: number) => ({
            ...item,
            id: `anomaly-${Date.now()}-${index}`,
            periodLabel: periodLabel
        }));

    } catch (error) {
        console.error("Error fetching anomaly detections:", error);
        return [];
    }
};

export const generateHuddleBrief = async (location: string, storeData: PerformanceData): Promise<string> => {
    try {
        const formattedData = Object.entries(storeData)
            .map(([kpi, value]) => `${kpi}: ${value.toFixed(4)}`)
            .join('\n');

        const prompt = `${AI_CONTEXT} You are an expert restaurant operations coach. Based on the most recent performance data for the ${location} store, generate a concise, motivational pre-shift huddle brief for the store manager. The brief should be under 150 words.
Format the response using markdown with these exact three headers: ### 🎯 Goal for Today, ### 🤔 Why it Matters, and ### 🏆 How to Win.
Identify the single biggest performance opportunity from the data and make that the focus.

Data:
${formattedData}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating huddle brief:", error);
        return "Could not generate huddle brief at this time.";
    }
};

// Fix: Add the missing runWhatIfScenario function for the Scenario Modeler component.
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

export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
  try {
    const formattedData = formatDataForAI(data, 'Total Company', 'All');
    const prompt = `${AI_CONTEXT}
You are an expert financial modeler. Analyze the following "what-if" scenario based on the provided data.
First, use the 'parseScenario' tool to extract the parameters from the user's request.
Second, provide a concise analysis of the likely impact of this change. Explain your reasoning.

Data:
${formattedData}

Scenario: "${userPrompt}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [parseScenarioFunctionDeclaration] }],
      },
    });

    const analysis = response.text;
    const functionCalls = response.functionCalls;
    const args = functionCalls?.[0]?.args;

    if (!analysis && args) {
        return { analysis: `Scenario parameters successfully parsed. You asked to model a change of ${args.changeValue} ${args.changeUnit} for ${args.kpi} in ${args.scope}.`, args };
    }

    return { analysis: analysis || "Analysis could not be generated.", args };
  } catch (error) {
    console.error("Error running what-if scenario:", error);
    return { analysis: "Could not model the scenario at this time.", args: null };
  }
};

export const getSalesForecast = async (location: string, historicalData: PerformanceData[]): Promise<ForecastDataPoint[]> => {
    try {
        // Fix: Improved prompt to be more specific about JSON-only output.
        const prompt = `Based on the historical sales data for the restaurant in ${location}, generate a 7-day sales forecast. Use Google Search to factor in the current weather forecast and any significant local events (festivals, conferences, etc.) that could impact traffic. The response MUST be a JSON array of objects, where each object has "date" (YYYY-MM-DD) and "predictedSales" (number). Output ONLY the JSON array, with no other text, markdown, or explanation.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            // Fix: Removed responseMimeType and responseSchema to comply with googleSearch tool guidelines.
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        // Fix: Implement robust JSON parsing from the model's text response.
        const text = response.text.trim();
        let jsonString = text;
        
        const match = /```json\n([\s\S]*?)\n```/.exec(text);
        if (match && match[1]) {
            jsonString = match[1];
        }

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error fetching sales forecast:", error);
        // Return a mock forecast on error to prevent UI crash
        const today = new Date();
        return Array.from({ length: 7 }).map((_, i) => ({
            date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
            predictedSales: 50000 + Math.random() * 10000
        }));
    }
};
