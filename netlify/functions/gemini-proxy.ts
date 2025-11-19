import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
import { createAnalysisJob, createImportJob, initializeFirebaseService } from '../../services/firebaseService';
import { Handler } from '@netlify/functions';

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
          const { location, storeData, audience } = payload;
          prompt = `You are an expert restaurant operations director creating a pre-shift huddle brief for the team at ${location}. The audience for this brief is the "${audience}" team. Using the provided performance data for the current period, generate a concise, motivating, and actionable brief in Markdown format.

The brief must include:
1.  **A Motivating Opener:** A short, positive opening to energize the team.
2.  **Key Wins:** Highlight 1-2 specific KPIs where the store is performing well. Use the data to back it up.
3.  **Area of Focus:** Identify 1-2 KPIs that need improvement. Frame this constructively as a team goal.
4.  **Team-Specific Action Item:** Provide one clear, actionable task relevant to the specified audience (${audience}).
    *   For **FOH** (Front of House), this MUST be a specific, tried-and-true sales contest (e.g., "First to Five," "Perfect Pair," "Review Roundup"). The contest must include a creative, non-monetary reward that teams genuinely enjoy (e.g., first pick of sections, a gift card to a local coffee shop, bragging rights with a trophy).
    *   For **BOH** (Back of House), focus on ticket times, food quality, or cost control (e.g., Food Cost, Prime Cost).
    *   For **Managers**, provide a higher-level focus area, like managing labor or improving overall profitability (e.g., SOP, Prime Cost).
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

Your analysis must include:
1.  **Key Local Competitors:** Identify 3-4 direct or significant indirect competitors within a 2-mile radius. For each, briefly describe their concept and why they are relevant.
2.  **Local Demand Drivers & Community Fabric:** What is the primary character of this neighborhood (e.g., office-heavy, nightlife hub, residential, tourist-focused)? What specific businesses, attractions, or demographics drive traffic and what does that mean for us?
3.  **The Real Happenings (Next 30 Days):** Dive deep to find the "real happenings" and cool events beyond just official city calendars. Look for concerts (large and small), live music at local venues, farmers markets, art walks, recurring community gatherings, and anything that creates local foot traffic. List at least 3-5 specific, upcoming events with dates.`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
          responsePayload = { content: response.text };
          break;
      }
       case 'getMarketingIdeas': {
          const { location } = payload;
          prompt = `You are a savvy, generational marketing strategist with a deep understanding of what local communities want. Generate 3 unique and actionable marketing ideas for our Tupelo Honey Southern Kitchen in ${location}.

Each idea must be in Markdown format and include:
1.  **Idea Title:** A catchy name for the campaign.
2.  **Concept:** A brief description of the idea, focusing on what makes it unique and appealing to the local community's cravings.
3.  **Target Generation:** Identify a primary target generation (e.g., Gen Z, Millennial, Gen X) and explain *why* this concept resonates with their specific values and media habits.
4.  **Guerrilla Tactic:** Include a specific, low-cost, high-impact **guerilla marketing tactic** to execute the idea and create authentic local buzz (e.g., a pop-up, a social media challenge, a hyper-local partnership).`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
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