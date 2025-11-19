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
3.  **Area of Focus:** Identify 1-2 KPIs that need improvement. Frame this constructively as a team goal for the upcoming shift/week.
4.  **Team-Specific Action Item:** Provide one clear, actionable task relevant to the specified audience (${audience}).
    *   For **FOH** (Front of House), focus on service, upselling, or guest experience (e.g., Avg. Reviews).
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
          prompt = `You are a market analyst for a restaurant group. Provide a concise local market analysis for our restaurant located in ${location}. The analysis should be in Markdown format and include:
- **Key Local Competitors:** Identify 3-4 direct or significant indirect competitors within a 2-mile radius. For each, briefly describe their concept.
- **Local Demand Drivers:** What are the key attractions, businesses, or demographic factors in the immediate area that drive restaurant traffic (e.g., convention center, university, major corporate offices, high-income residential areas)?
- **Upcoming Events:** Mention any notable upcoming public events in the area that could impact restaurant traffic in the next 30 days.`;
          const response = await ai.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
          responsePayload = { content: response.text };
          break;
      }
       case 'getMarketingIdeas': {
          const { location } = payload;
          prompt = `You are a creative restaurant marketing strategist. Generate 3 unique, actionable, and localized marketing ideas for our Tupelo Honey Southern Kitchen in ${location}. The ideas should be in Markdown format, with each idea having a clear title and a brief description of the concept and execution. Focus on ideas that leverage local partnerships, events, or community characteristics.`;
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
