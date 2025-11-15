import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Kpi, PerformanceData, View } from '../types';

// The execution environment provides the API key via `process.env.API_KEY`.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please ensure the API_KEY environment variable is set.");
}

// Initialize AI only if API_KEY exists
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

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
  if (!ai) return "AI features disabled. API key missing.";
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
    if (!ai) return "AI features disabled. API key missing.";
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
  if (!ai) return "AI features disabled. API key missing.";
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
    if (!ai) return "AI features disabled. API key missing.";
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


export const getWeatherImpact = async (location: string): Promise<string> => {
    if (!ai) return "AI features disabled. API key missing.";
    try {
        const prompt = `${AI_CONTEXT} Analyze the historical relationship between weather patterns and restaurant sales for a southern-style restaurant located in ${location}. How might approaching good or bad weather (e.g., sunny weekend vs. snowstorm) typically impact sales based on general industry trends for this type of cuisine and location? Provide a brief, actionable summary for an Area Director.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching weather impact:", error);
        return "Could not analyze weather impact at this time.";
    }
};

export const getLocalEvents = async (location: string): Promise<string> => {
    if (!ai) return "AI features disabled. API key missing.";
    try {
        const prompt = `What are the major current or upcoming events in ${location} that could impact restaurant traffic? Include things like conferences, festivals, major sporting events, or holidays.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        let content = response.text;
        const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (citations && citations.length > 0) {
            content += "\n\n**Sources:**\n";
            citations.forEach((citation: any) => {
                if (citation.web && citation.web.uri) {
                   content += `- [${citation.web.title || 'Source'}](${citation.web.uri})\n`;
                }
            });
        }
        return content;

    } catch (error) {
        console.error("Error fetching local events:", error);
        return "Could not retrieve local events at this time.";
    }
};


const whatIfFunctionDeclarations: FunctionDeclaration[] = [
    {
        name: "calculateImpact",
        description: "Calculates the financial impact of a percentage change on a specific KPI for a given region or the total company.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                kpi: { type: Type.STRING, description: "The KPI to change, e.g., 'Food Cost', 'Labor Cost', 'Sales'."},
                changePercentage: { type: Type.NUMBER, description: "The percentage change to apply, e.g., -0.5 for a 0.5% drop, 2 for a 2% increase." },
                scope: { type: Type.STRING, description: "The scope of the change, e.g., 'Heather's region', 'Total Company', 'Denver, CO'."}
            },
            required: ["kpi", "changePercentage", "scope"]
        }
    }
];

export const runWhatIfScenario = async (data: any, prompt: string) => {
    if (!ai) return { analysis: "AI features disabled. API key missing." };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Context: ${AI_CONTEXT}\n\nParse the following user request and call the appropriate function: "${prompt}"`,
            config: {
                tools: [{ functionDeclarations: whatIfFunctionDeclarations }]
            }
        });

        const functionCalls = response.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
            const { name, args } = functionCalls[0];
            if (name === 'calculateImpact') {
                // This is a simplified simulation of the calculation logic.
                const { kpi, changePercentage, scope } = args;
                const analysis = `Simulating a ${changePercentage}% change in ${kpi} for ${scope}.\nThis would likely result in a significant shift in Store Operating Profit.\n(This is a simulated result based on function calling.)`;
                return { analysis, args };
            }
        }
        return { analysis: "Could not determine the parameters for the scenario. Please try rephrasing your request." };

    } catch (error) {
        console.error("Error running what-if scenario:", error);
        return { analysis: "An error occurred while running the scenario." };
    }
};