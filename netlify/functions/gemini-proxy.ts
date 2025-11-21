import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
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
          prompt = `You are a hospitality analyst. Summarize recent online reviews for the Tupelo Honey restaurant in ${location}. Your summary should be in Markdown format and include:
- A title "Recent Buzz for ${location}".
- A short paragraph summarizing overall sentiment.
- A bulleted list of "Common Praises".
- A bulleted list of "Opportunities for Improvement".
Your tone should be professional and constructive.`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
          responsePayload = { content: response.text };
          break;
      }
      case 'getLocationMarketAnalysis': {
          const { location } = payload;
          prompt = `You are a hyper-local market intelligence expert for a restaurant group. Provide a deep, granular-level local market analysis for our restaurant located in ${location}. Your goal is to uncover anything that could affect business. The analysis must be in Markdown format.

CONTEXT:
- **Holidays:** ${holidayContext} Consider how these holidays will impact local events and foot traffic.

ANALYSIS MUST INCLUDE:
1.  **Key Local Competitors:** Identify 3-4 direct or significant indirect competitors within a 2-mile radius.
2.  **Local Demand Drivers:** What is the primary character of this neighborhood (e.g., office-heavy, nightlife hub, residential, tourist-focused)?
3.  **The Real Happenings (Next 30 Days):** Dive deep to find "cool events" beyond official calendars. Look for concerts (large and small), live music at local venues, farmers markets, art walks, and recurring community gatherings. List at least 3-5 specific, upcoming events with dates, factoring in any relevant holidays.`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
          responsePayload = { content: response.text };
          break;
      }
       case 'getMarketingIdeas': {
          const { location } = payload;
          prompt = `You are a savvy, generational marketing strategist with a deep understanding of what local communities want. Generate 3 unique and actionable marketing ideas for our Tupelo Honey Southern Kitchen in ${location}.

CONTEXT:
- **Holidays:** ${holidayContext} Your ideas should be timely and relevant to these holidays if applicable.

EACH IDEA MUST INCLUDE:
1.  **Idea Title:** A catchy name for the campaign.
2.  **Concept:** A brief description, focusing on what makes it unique and appealing to the local community's cravings.
3.  **Target Generation:** Identify a primary target generation (e.g., Gen Z, Millennial, Gen X) and explain *why* this concept resonates with their specific values.
4.  **Guerrilla Tactic:** Include a specific, low-cost, high-impact **guerrilla marketing tactic** to execute the idea and create authentic local buzz.`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
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
      
      // ... other cases for getInsights, getTrendAnalysis etc. would go here ...
      
      default:
        // For any action not yet implemented with a custom prompt, return an informative error.
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