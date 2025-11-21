import { GoogleGenAI } from "@google/genai";
import { createAnalysisJob, createImportJob, initializeFirebaseService } from '../../services/firebaseService';
import { Handler } from '@netlify/functions';
import { isHoliday } from "../../utils/dateUtils";

export const handler: Handler = async (event, _context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  
  const status = await initializeFirebaseService();
  if (status.status === 'error') {
      return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: `Firebase initialization failed: ${status.message}` }),
      };
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

    const invokeBackgroundFunction = (functionName: string, payload: any) => {
        const origin = new URL(event.rawUrl).origin;
        const functionUrl = `${origin}/.netlify/functions/${functionName}`;
        fetch(functionUrl, { method: 'POST', body: JSON.stringify({ payload }) })
            .catch(err => console.error(`Error invoking background function '${functionName}':`, err));
    };

    let prompt = '';
    let responsePayload: any = {};
    // Use the stable flash model for speed and reliability
    const model = 'gemini-2.5-flash';

    // --- Context Enrichment ---
    const today = new Date();
    const upcomingHolidays = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const holidayName = isHoliday(date);
      if (holidayName) {
        upcomingHolidays.push(`${holidayName} on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`);
      }
    }
    const holidayContext = upcomingHolidays.length > 0 ? `Upcoming Major US Holidays (next 30 days): ${upcomingHolidays.join(', ')}.` : "No major US holidays in the next 30 days.";


    switch (action) {
      // --- Background Job Triggers ---
      case 'startStrategicAnalysis': {
        const jobId = await createAnalysisJob(payload);
        invokeBackgroundFunction('process-analysis-job', { jobId });
        return { statusCode: 200, headers, body: JSON.stringify({ jobId }) };
      }
      case 'startImportJob': {
        const jobId = await createImportJob(payload);
        invokeBackgroundFunction('process-import-job', { jobId });
        return { statusCode: 200, headers, body: JSON.stringify({ jobId }) };
      }
      case 'deleteFile': {
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // --- Synchronous AI Generation ---
      case 'chatWithStrategy': {
          const { context, userQuery, mode } = payload;
          
          let systemInst = "You are a helpful business strategy assistant.";
          if (mode === 'Financial') systemInst = "You are a strict CFO assistant. Focus on numbers, margins, and ROI.";
          if (mode === 'Operational') systemInst = "You are an Operations Director assistant. Focus on execution and efficiency.";
          if (mode === 'Marketing') systemInst = "You are a Marketing Strategist assistant. Focus on brand and growth.";

          prompt = `
          ${systemInst}
          
          CONTEXT (Previous Analysis):
          ${context}
          
          USER QUESTION:
          ${userQuery}
          
          Provide a concise, Markdown-formatted answer based on the context provided. Do not hallucinate data not present in the context or implied by it.
          `;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getExecutiveSummary': {
          const { data, view, periodLabel } = payload;
          prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Southern Kitchen for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs) highlighting the most significant wins, challenges, and key areas for focus. The data represents director-level aggregates. Your analysis should be sharp, insightful, and tailored for an executive audience. Data:\n${JSON.stringify(data, null, 2)}`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getNoteTrends': {
          const { notes } = payload;
          prompt = `You are an expert operations analyst for a restaurant group. Analyze these notes and identify the top 3-4 recurring themes or trends. Provide the output as a concise, bulleted list in Markdown. Notes:\n${JSON.stringify(notes.map((n:any) => n.content))}`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'generateHuddleBrief': {
          const { location, storeData, audience, weather } = payload;
          const weatherContext = weather ? `Today's weather forecast is: ${weather.temperature}°F, ${weather.shortForecast}.` : "Weather information is not available.";
          prompt = `You are an expert restaurant operations director creating a pre-shift huddle brief for the team at ${location}. The audience is the "${audience}" team. Using the provided performance data, weather, and holiday context, generate a concise, motivating, and actionable brief in Markdown format.

CONTEXT:
- **Weather:** ${weatherContext} Use this to inform the team about potential impacts on business (e.g., "it's going to be raining from 11am until 4, we may see less patio traffic").
- **Holidays:** ${holidayContext} Mention any upcoming holidays that could impact business.

BRIEF STRUCTURE:
1.  **A Motivating Opener:** A short, positive opening to energize the team.
2.  **Key Wins:** Highlight 1-2 specific KPIs where the store is performing well. Use the data to back it up.
3.  **Area of Focus:** Identify 1-2 KPIs that need improvement. Frame this constructively as a team goal.
4.  **Team-Specific Action Item:** Provide one clear, actionable task relevant to the specified audience (${audience}).
    *   For **FOH**, this MUST be a specific, tried-and-true sales contest (e.g., "First to Five," "Perfect Pair," "Review Roundup"). The contest must include a creative, non-monetary reward that teams genuinely enjoy (e.g., first pick of sections, a gift card to a local coffee shop, bragging rights with a trophy).
    *   For **BOH**, focus on ticket times, food quality, or cost control.
    *   For **Managers**, provide a higher-level focus area, like managing labor or improving overall profitability.
5.  **A Closing Message:** End with a positive and encouraging closing statement.

Here is the performance data for ${location}:
${JSON.stringify(storeData, null, 2)}`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getReviewSummary': {
          const { location } = payload;
          prompt = `You are a hospitality analyst. Summarize typical online reviews for a Tupelo Honey Southern Kitchen & Bar restaurant. Assume general positive sentiment but highlight common industry complaints if specific data is missing. Your summary should be in Markdown format and include:
- A title "Recent Buzz for ${location}".
- A short paragraph summarizing overall sentiment.
- A bulleted list of "Common Praises".
- A bulleted list of "Opportunities for Improvement".
Your tone should be professional and constructive.`;
          // Rely on internal knowledge to prevent timeout errors with Google Search
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getLocationMarketAnalysis': {
          const { location } = payload;
          prompt = `You are a hyper-local market intelligence expert. Provide a market analysis for a restaurant located in ${location}. The analysis must be in Markdown format.

CONTEXT:
- **Holidays:** ${holidayContext}

ANALYSIS MUST INCLUDE:
1.  **Local Vibe:** What is the primary character of the main dining neighborhoods in ${location} (e.g., office-heavy, nightlife hub)?
2.  **Competitor Landscape:** Mention 2-3 types of restaurants that are popular competitors in this area.
3.  **Upcoming Events (Simulated):** List 3 plausible types of events (concerts, markets, sports) that typically happen in ${location} during this time of year.`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
       case 'getMarketingIdeas': {
          const { location } = payload;
          prompt = `You are a savvy, generational marketing strategist. Generate 3 unique and actionable marketing ideas for a Southern restaurant in ${location}.

CONTEXT:
- **Holidays:** ${holidayContext}

EACH IDEA MUST INCLUDE:
1.  **Idea Title:** A catchy name for the campaign.
2.  **Concept:** A brief description.
3.  **Target Generation:** Identify a primary target generation.
4.  **Guerrilla Tactic:** Include a low-cost, high-impact tactic.`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
       }
       case 'getQuadrantAnalysis': {
           const { data, periodLabel, kpiAxes } = payload;
           prompt = `Analyze this restaurant performance scatter plot data for period "${periodLabel}". 
           Y-Axis (Vertical): ${kpiAxes.y} Variance.
           X-Axis (Horizontal): ${kpiAxes.x} Variance.
           Z-Axis (Size): ${kpiAxes.z} Actual Value.
           
           Data: ${JSON.stringify(data)}
           
           Identify 2-3 clear clusters of stores (e.g., 'High Sales Growth but Low Efficiency', 'Star Performers'). 
           Provide specific recommendations for the underperformers. Output in Markdown.`;
           const response = await ai.models.generateContent({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
       }
       case 'getStrategicExecutiveAnalysis': {
           const { kpi, periodLabel, companyTotal, directorData, laggards } = payload;
           prompt = `You are the Chief Financial Officer (CFO) of a restaurant group. You are writing a brief, high-level analysis for the CEO.
           
           **Focus Metric:** ${kpi}
           **Period:** ${periodLabel}
           **Company Total:** ${companyTotal}
           
           **Regional Performance (Director Breakdown):**
           ${JSON.stringify(directorData, null, 2)}
           
           **The "Anchors" (Bottom 3 Stores pulling us down):**
           ${JSON.stringify(laggards, null, 2)}
           
           **Instructions:**
           1.  **Financial Impact:** In 1-2 sentences, assess the company's position on this metric. Is it a risk to profitability?
           2.  **Leadership Focus:** Identify which Director needs to take immediate action. Don't just list data; hold them accountable.
           3.  **The Anchor Plan:** Provide ONE specific, aggressive instruction for the worst-performing store (the "Anchor") to turn this metric around immediately.
           
           Keep the tone professional, direct, and financially minded. Use Markdown.`;
           const response = await ai.models.generateContent({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
       }

       // --- RESTORED MISSING HANDLERS ---

       case 'getSalesForecast': {
          const { location, weatherForecast } = payload;
          prompt = `You are an expert restaurant demand planner. 
          Generate a 7-day sales forecast for a restaurant in ${location} based on the following weather forecast:
          ${JSON.stringify(weatherForecast)}
          
          Return a JSON array of objects with keys: "date", "predictedSales" (number), "weatherDescription" (string).
          Assume baseline daily sales of $5500. Adjust up for good weather (sunny/cloudy) and weekends. Adjust down for bad weather (rain/snow).`;
          const response = await ai.models.generateContent({ 
              model, 
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          responsePayload = { forecast: JSON.parse(response.text || '[]') };
          break;
      }
      
      case 'getVarianceAnalysis': {
          const { location, kpi, variance, allKpis } = payload;
          prompt = `Analyze the ${variance > 0 ? 'positive' : 'negative'} variance of ${(variance * 100).toFixed(1)}% for ${kpi} at ${location}.
          Context (Other KPIs): ${JSON.stringify(allKpis)}
          Provide a 1-sentence potential root cause and 1-sentence recommendation.`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getInsights': {
          const { data, query } = payload;
          prompt = `Answer this question based on the data provided: "${query}"\nData: ${JSON.stringify(data)}`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      
      case 'getTrendAnalysis': {
           const { historicalData } = payload;
           prompt = `Analyze these historical trends: ${JSON.stringify(historicalData)}. Identify 3 key patterns.`;
           const response = await ai.models.generateContent({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
      }

      case 'getDirectorPerformanceSnapshot': {
          const { directorName, directorData } = payload;
          prompt = `Provide a performance snapshot for ${directorName} based on: ${JSON.stringify(directorData)}.`;
          const response = await ai.models.generateContent({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getAnomalyDetections': {
          const { allStoresData } = payload;
          prompt = `Identify anomalies in this store data: ${JSON.stringify(allStoresData)}. Return JSON array of objects: { id, location, kpi, deviation (number), summary, analysis }.`;
          const response = await ai.models.generateContent({ 
              model,
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          responsePayload = { anomalies: JSON.parse(response.text || '[]') };
          break;
      }

      case 'runWhatIfScenario': {
          const { data, userPrompt } = payload;
          prompt = `Model this scenario: "${userPrompt}" based on current data: ${JSON.stringify(data)}. Return JSON: { analysis: string, args: object }`;
          const response = await ai.models.generateContent({ 
              model,
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          responsePayload = JSON.parse(response.text || '{}');
          break;
      }
      
      default:
        return { 
            statusCode: 501, 
            headers, 
            body: JSON.stringify({ error: `Action '${action}' is not implemented on the server.` }) 
        };
    }

    return { statusCode: 200, headers, body: JSON.stringify(responsePayload) };
    
  } catch (error: any) {
    console.error('Error in Gemini proxy:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};