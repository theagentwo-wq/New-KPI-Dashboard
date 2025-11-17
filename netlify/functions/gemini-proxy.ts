import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Kpi, PerformanceData, View, ForecastDataPoint, DailyForecast, Note } from '../../types';
import { KPI_CONFIG } from '../../constants';

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
    
    // This function runs on Netlify's backend.
    // The API key is securely accessed from environment variables and never exposed to the client.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
         return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "AI Service Error: The GEMINI_API_KEY environment variable is not configured on the server. Please check your Netlify site settings." }) 
        };
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const { action, payload } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'getPlaceDetails': {
                const { address, location } = payload;
                if (!address || !location) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing address or location' }) };
                }

                // Step 1: Find Place ID
                const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`Tupelo Honey Southern Kitchen & Bar ${location}`)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
                const findPlaceResponse = await fetch(findPlaceUrl);
                if (!findPlaceResponse.ok) throw new Error('Find Place API request failed');
                
                const findPlaceData = await findPlaceResponse.json();
                if (findPlaceData.status !== 'OK' || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
                     return { statusCode: 404, headers, body: JSON.stringify({ error: `Place not found for location: ${location}` }) };
                }

                const placeId = findPlaceData.candidates[0].place_id;

                // Step 2: Get Place Details
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,photos&key=${apiKey}`;
                const detailsResponse = await fetch(detailsUrl);
                if (!detailsResponse.ok) throw new Error('Place Details API request failed');
                
                const detailsData = await detailsResponse.json();
                if (detailsData.status !== 'OK' || !detailsData.result) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: `Could not get details for place_id: ${placeId}` }) };
                }

                const { name, rating, photos } = detailsData.result;

                // Step 3: Construct Photo URLs
                const photoUrls = (photos || []).slice(0, 10).map((photo: any) => {
                    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
                });

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ name, rating, photoUrls }),
                };
            }
            
            case 'getStreetViewMetadata': {
                const { address, lat: fallbackLat, lon: fallbackLon } = payload;
                if (!address) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing address' }) };
                }

                // Primary Method: Geocode the address for highest accuracy
                try {
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                    const geocodeResponse = await fetch(geocodeUrl);
                    if (!geocodeResponse.ok) throw new Error('Geocoding API request failed');
                    
                    const geocodeData = await geocodeResponse.json();
                    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
                        throw new Error(`Geocoding failed with status: ${geocodeData.status}`);
                    }

                    const location = geocodeData.results[0].geometry.location;
                    const { lat, lng: lon } = location;

                    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lon}&key=${apiKey}`;
                    const metadataResponse = await fetch(metadataUrl);
                    const metadata = await metadataResponse.json();
                    
                    return { statusCode: 200, headers, body: JSON.stringify({ status: metadata.status, lat, lon }) };

                } catch (error) {
                    console.warn("Geocoding failed, falling back to stored coordinates. Error:", error);
                    
                    // Fallback Method: Use pre-existing coordinates
                    if (fallbackLat && fallbackLon) {
                        const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${fallbackLat},${fallbackLon}&key=${apiKey}`;
                        const metadataResponse = await fetch(metadataUrl);
                        const metadata = await metadataResponse.json();
                        
                        return { statusCode: 200, headers, body: JSON.stringify({ status: metadata.status, lat: fallbackLat, lon: fallbackLon }) };
                    } else {
                        // If fallback also fails
                        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ERROR', message: 'Geocoding failed and no fallback coordinates were provided.' }) };
                    }
                }
            }

            case 'getExecutiveSummary': {
                const { data, view, periodLabel } = payload;
                const formattedData = formatDataForAI(data, view, 'All');
                const prompt = `${AI_CONTEXT} Based on the following data for ${periodLabel}, provide a concise 2-3 sentence executive summary of the performance for ${view}. Highlight the most significant win and the biggest area for improvement. Data:\n${formattedData}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
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
                return { statusCode: 200, headers, body: JSON.stringify({ content }) };
            }

            case 'getTrendAnalysis': {
                const { historicalData, view } = payload;
                const formattedData = formatHistoricalDataForAI(historicalData, view);
                const prompt = `${AI_CONTEXT} Based on the following historical data for "${view}", analyze the trends for the key KPIs over these periods. Identify 1-2 of the most significant positive or negative trends. Explain what the trend is (e.g., "Food Cost is consistently increasing") and briefly suggest a potential implication. Present the analysis in a clear, bulleted list.\n\nData:\n${formattedData}`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }

            case 'getDirectorPerformanceSnapshot': {
                 const { directorName, periodLabel, directorData } = payload;
                 const formattedData = Object.entries(directorData).map(([kpi, value]) => `${kpi}: ${(value as number).toFixed(4)}`).join('\n');
                 const prompt = `${AI_CONTEXT}\nBased on the aggregated performance data for director ${directorName}'s region for the period "${periodLabel}", provide a concise performance snapshot. Format the response using markdown with these exact three headers: ### 🏆 Key Win, ### 📉 Key Challenge, and ### 🎯 Strategic Focus. For the "Key Win", identify the top-performing KPI and briefly explain its positive impact. For the "Key Challenge", identify the most significant underperforming KPI and its negative impact. For the "Strategic Focus", provide a single, clear, actionable recommendation based on restaurant industry best practices to improve the key challenge.\n\nData:\n${formattedData}`;
                 const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                 return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
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
                return { statusCode: 200, headers, body: JSON.stringify({ data }) };
            }

            case 'generateHuddleBrief': {
                const { location, storeData, audience } = payload;
                const formattedData = Object.entries(storeData).map(([kpi, value]) => `${kpi}: ${(value as number).toFixed(4)}`).join('\n');
                let audienceFocus = '';
                switch (audience) {
                    case 'FOH': audienceFocus = "Focus on guest experience, upselling, service flow. Audience: servers, hosts, bartenders."; break;
                    case 'BOH': audienceFocus = "Focus on ticket times, food quality, prep lists. Audience: cooks, dishwashers."; break;
                    case 'Managers': audienceFocus = "Holistic overview, strategic focus, team motivation. Audience: management team."; break;
                }
                const prompt = `${AI_CONTEXT}
Generate a concise 'HOT TOPICS' huddle brief for the ${audience} team at our ${location} store.
Requirements:
1.  Audience: ${audienceFocus}
2.  Data Focus: From data below, find and focus on the single biggest performance opportunity.
3.  Local Intel (Use Tools): Find today's weather and one major local event near ${location}. State their operational impact.
4.  Promotions (Use Tools): Find one current promotion on tupelohoneycafe.com to mention.
5.  Format: Markdown bullets, under 200 words.
Performance Data:
${formattedData}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] }
                });
                let content = response.text || "Could not generate huddle brief at this time.";
                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks?.length) {
                    const sources = new Set<string>();
                    groundingChunks.forEach((chunk: any) => { if (chunk.web?.uri) sources.add(`[${chunk.web.title || 'Source'}](${chunk.web.uri})`); });
                    if (sources.size > 0) content += "\n\n---\n*Sources: " + Array.from(sources).join(', ') + "*";
                }
                return { statusCode: 200, headers, body: JSON.stringify({ content }) };
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
                return { statusCode: 200, headers, body: JSON.stringify({ data: responseData }) };
            }

             case 'getSalesForecast': {
                const { location, weatherForecast } = payload as { location: string; weatherForecast: DailyForecast[] };
                const formattedWeather = weatherForecast.map(day => 
                    `${day.date}: ${day.shortForecast}, Temp: ${day.temperature}°F`
                ).join('; ');

                const prompt = `Based on typical sales patterns for a southern-style restaurant in ${location}, and factoring in the following detailed 7-day weather forecast, generate a 7-day sales forecast. Give significant weight to the weather, especially weekend weather. Sunny warm days increase sales (patio dining), while rain or snow decreases them. The response MUST be a JSON array of objects, where each object has "date" (matching the input dates) and "predictedSales" (number). Output ONLY the JSON array, with no other text, markdown, or explanation.\n\nWeather Forecast:\n${formattedWeather}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const text = response.text?.trim();
                let data: ForecastDataPoint[] = [];
                if (text) {
                    try {
                        const match = /\[[\s\S]*\]/.exec(text);
                        if (match && match[0]) {
                            const parsed = JSON.parse(match[0]);
                            // Merge weather data back in for frontend display
                            data = parsed.map((item: any) => {
                                const weatherDay = weatherForecast.find(wf => new Date(wf.date).toDateString() === new Date(item.date).toDateString());
                                return {
                                    ...item,
                                    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
                                    weatherIcon: weatherDay?.condition,
                                    weatherDescription: `${weatherDay?.temperature}°F - ${weatherDay?.shortForecast}`
                                };
                            });
                        }
                    } catch (e) {
                         console.error("Failed to parse sales forecast JSON:", e);
                    }
                }
                return { statusCode: 200, headers, body: JSON.stringify({ data }) };
            }

            case 'getReviewSummary': {
                const { location } = payload;
                const prompt = `${AI_CONTEXT}\nUser wants customer sentiment for our restaurant in "${location}". Use Google Search for recent Google Reviews. Analyze and identify top 3 positive themes and top 3 areas for improvement. For each theme, provide 1-2 anonymous, representative customer quotes. Format response as markdown with headers "### 👍 Top 3 Positives", "### 📉 Areas for Improvement", and "### 💬 Representative Quotes".`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] }
                });
                let content = response.text || "Review analysis could not be generated at this time.";
                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks?.length) {
                    const sources = new Set<string>();
                    groundingChunks.forEach((chunk: any) => { if (chunk.web?.uri) sources.add(`[${chunk.web.title || 'Review Source'}](${chunk.web.uri})`); });
                    if (sources.size > 0) content += "\n\n**Sources:**\n" + Array.from(sources).map(s => `- ${s}`).join('\n');
                }
                return { statusCode: 200, headers, body: JSON.stringify({ content }) };
            }
            
            case 'getVarianceAnalysis': {
                const { location, kpi, variance, allKpis } = payload;
                const formattedKpis = Object.entries(allKpis).map(([key, val]) => `${key}: ${(val as number).toFixed(4)}`).join(', ');
                const prompt = `For the ${location} restaurant, ${kpi} had a variance of ${variance.toFixed(4)}. Given the other KPI values for this period (${formattedKpis}), provide a very brief, one-sentence hypothesis explaining a potential reason for this specific variance. Start your response directly with the hypothesis. Example: 'The negative variance in SOP is likely driven by the increase in Food Cost.'`;
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }
            
            case 'getQuadrantAnalysis': {
                const { data, periodLabel, kpiAxes } = payload;
                const { x, y, z } = kpiAxes;
                
                const isXCost = KPI_CONFIG[x as Kpi].higherIsBetter === false;
                const xGoodDirection = isXCost ? 'negative (cost reduction)' : 'positive (profit growth)';
                const xBadDirection = isXCost ? 'positive (cost increase)' : 'negative (profit decline)';

                const prompt = `${AI_CONTEXT} You are a master business strategist. Analyze the following restaurant performance data for the period "${periodLabel}", which is visualized in a 4-quadrant Performance Matrix.

**IMPORTANT CONTEXT ON DATA:**
- The (x, y) values represent the ABSOLUTE VARIANCE from the comparison period. They are NOT relative percentages.
- For currency KPIs (like Sales), the value is the dollar variance (e.g., 5000 means a +$5,000 variance).
- For percentage KPIs (like SOP or Prime Cost), the value is the percentage POINT variance (e.g., 0.02 means a +2 percentage point variance).

**Matrix Definition:**
- **X-Axis:** ${x} Variance (Represents efficiency/profitability changes)
- **Y-Axis:** ${y} Variance (Represents growth/quality changes. Higher is always better.)
- **Bubble Size:** ${z} (Absolute value, represents context)
- **Center Point (0,0):** The comparison baseline.

**The Four Quadrants:**
1.  **Top-Right (Stars):** High Growth/Quality (y > 0) AND Good Profit/Cost Management (x is ${xGoodDirection}). These are top performers.
2.  **Top-Left (Growth Focus):** High Growth/Quality (y > 0) BUT Weaker Profit/Cost Management (x is ${xBadDirection}).
3.  **Bottom-Right (Profit Focus):** Low Growth/Quality (y < 0) BUT Good Profit/Cost Management (x is ${xGoodDirection}).
4.  **Bottom-Left (Needs Attention):** Low Growth/Quality (y < 0) AND Weaker Profit/Cost Management (x is ${xBadDirection}).

**Your Task:**
Provide a concise, high-level strategic analysis based on the distribution of locations in these quadrants.
1. Briefly summarize the overall business health based on where most locations are clustered.
2. Identify 1-2 key outliers (e.g., a "Star" with a huge ${z} value, or a location deep in the "Needs Attention" quadrant) and explain their significance.
3. Provide one key strategic recommendation for the business based on the overall pattern.

Present your analysis in clean, readable markdown.

**Data (name, x_variance, y_variance, z_value):**
${JSON.stringify(data, null, 2)}`;
                
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }
            
            case 'getLocationMarketAnalysis': {
                const { location } = payload;
                const prompt = `${AI_CONTEXT} You are a market intelligence expert. For our restaurant in ${location}, generate a hyper-local market snapshot. Use your tools to find relevant, recent information.
Format the response using markdown with these exact headers:
- ### 🗓️ Upcoming Events (Next 30 days)
- ### 🏟️ Sports & Concerts
- ### 🏗️ Traffic & Construction
- ### ✨ Other Local Buzz
For each header, provide 2-3 bullet points of the most significant items that could impact restaurant foot traffic.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] }
                });
                let content = response.text || "Market analysis could not be generated at this time.";
                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks?.length) {
                    const sources = new Set<string>();
                    groundingChunks.forEach((chunk: any) => { if (chunk.web?.uri) sources.add(`[${chunk.web.title || 'Source'}](${chunk.web.uri})`); });
                    if (sources.size > 0) content += "\n\n**Sources:**\n" + Array.from(sources).map(s => `- ${s}`).join('\n');
                }
                return { statusCode: 200, headers, body: JSON.stringify({ content }) };
            }

            case 'getMarketingIdeas': {
                const { location, userLocation } = payload;
                const prompt = `${AI_CONTEXT} You are a creative marketing strategist. For our restaurant in ${location}, generate 3 distinct, hyper-local marketing ideas. Use tools to identify nearby points of interest (schools, businesses, venues) as partners. For each idea, provide a "Concept", a "Rationale" for this specific area, and simple "Execution Steps". Focus on community engagement, local partnerships, and direct outreach. Format as a markdown list.`;

                const modelConfig: any = { tools: [{ googleSearch: {} }, { googleMaps: {} }] };
                if (userLocation) {
                    modelConfig.toolConfig = { retrievalConfig: { latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude }}};
                }
                
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: modelConfig });
                let content = response.text || "Marketing ideas could not be generated at this time.";
                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks?.length) {
                    const sources = new Set<string>();
                     groundingChunks.forEach((chunk: any) => {
                        if (chunk.web?.uri) sources.add(`[${chunk.web.title || 'Web Source'}](${chunk.web.uri})`);
                        if (chunk.maps?.uri) sources.add(`[${chunk.maps.title || 'Map Location'}](${chunk.maps.uri})`);
                    });
                    if (sources.size > 0) content += "\n\n**Sources & Relevant Locations:**\n" + Array.from(sources).map(s => `- ${s}`).join('\n');
                }
                return { statusCode: 200, headers, body: JSON.stringify({ content }) };
            }

            case 'getNoteTrends': {
                const { notes } = payload as { notes: Note[] };
                const formattedNotes = notes.map(n => `- Note (${n.category}, ${new Date(n.createdAt).toLocaleDateString()}): ${n.content}`).join('\n');
                const prompt = `${AI_CONTEXT} As an operations analyst, I have a collection of notes for a specific restaurant or region. Your task is to analyze these notes and identify recurring themes or critical issues.

**Instructions:**
1.  Read all the notes provided below.
2.  Identify up to 3 of the most significant, recurring themes (e.g., "Staffing Shortages", "Equipment Maintenance", "Positive Guest Feedback on new Menu Item", "Marketing Success").
3.  For each theme, provide a concise one-sentence summary.
4.  For each theme, suggest one clear, actionable recommendation or next step for management to consider.
5.  Format your response using markdown with bold headers for each theme. If no significant trends are found, state that.

**Notes to Analyze:**
${formattedNotes}`;

                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
            }

            default:
                return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
        }
    } catch (error: any) {
        console.error('Error in Gemini proxy:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
    }
};