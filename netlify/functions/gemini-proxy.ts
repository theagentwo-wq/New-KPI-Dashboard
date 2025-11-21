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
  
  // Initialize Firebase only if needed for specific actions to save cold-start time
  // However, current logic checks it upfront. We keep it but wrap in try-catch.
  try {
      const status = await initializeFirebaseService();
      if (status.status === 'error') {
          console.warn(`Firebase initialization warning: ${status.message}. Proceeding with AI-only tasks if possible.`);
      }
  } catch (e) {
      console.warn("Firebase init failed entirely, proceeding cautiously.", e);
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

    // Helper for safe generation with timeout
    const generateContentSafe = async (params: any) => {
        // Create a timeout promise that rejects after 9 seconds
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini API Request Timed Out")), 9000)
        );

        // Race the API call against the timeout
        const result: any = await Promise.race([
            ai.models.generateContent(params),
            timeoutPromise
        ]);
        return result;
    };

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

          prompt = `${systemInst}\nCONTEXT:\n${context}\nUSER QUESTION:\n${userQuery}\nProvide a concise Markdown answer.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getExecutiveSummary': {
          const { data, view, periodLabel } = payload;
          prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Southern Kitchen for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs). Data:\n${JSON.stringify(data, null, 2)}`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getNoteTrends': {
          const { notes } = payload;
          prompt = `Analyze these notes and identify top 3 trends. Concise bullet points. Notes:\n${JSON.stringify(notes.map((n:any) => n.content))}`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'generateHuddleBrief': {
          const { location, storeData, audience, weather } = payload;
          const weatherContext = weather ? `Today's weather forecast is: ${weather.temperature}°F, ${weather.shortForecast}.` : "Weather information is not available.";
          prompt = `Create a pre-shift huddle brief for the ${audience} team at ${location}.
CONTEXT: Weather: ${weatherContext}. Holidays: ${holidayContext}
STRUCTURE: Motivating Opener, Key Wins, Area of Focus, Team Action Item, Closing.
Data: ${JSON.stringify(storeData, null, 2)}`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getReviewSummary': {
          const { location } = payload;
          prompt = `Summarize typical online reviews for Tupelo Honey Southern Kitchen & Bar at ${location}. Include "Common Praises" and "Opportunities". Markdown format.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      case 'getLocationMarketAnalysis': {
          const { location } = payload;
          prompt = `Provide a market analysis for ${location}. Context: ${holidayContext}. Include: Local Vibe, Competitor Landscape, Upcoming Events. Markdown format.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
       case 'getMarketingIdeas': {
          const { location } = payload;
          prompt = `Generate 3 marketing ideas for a restaurant in ${location}. Context: ${holidayContext}. Include: Title, Concept, Target Gen, Guerrilla Tactic.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
       }
       case 'getQuadrantAnalysis': {
           const { data, periodLabel, kpiAxes } = payload;
           prompt = `Analyze scatter plot data for "${periodLabel}". Y:${kpiAxes.y} Var, X:${kpiAxes.x} Var, Z:${kpiAxes.z} Actual. Data: ${JSON.stringify(data)}. Identify clusters.`;
           const response = await generateContentSafe({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
       }
       case 'getStrategicExecutiveAnalysis': {
           const { kpi, periodLabel, companyTotal, directorData, laggards } = payload;
           prompt = `CFO Analysis for ${kpi} in ${periodLabel}. Total: ${companyTotal}. Regional: ${JSON.stringify(directorData)}. Anchors: ${JSON.stringify(laggards)}. Provide Financial Impact, Leadership Focus, and Anchor Plan.`;
           const response = await generateContentSafe({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
       }

       case 'getSalesForecast': {
          const { location, weatherForecast } = payload;
          prompt = `Generate 7-day sales forecast for ${location}. Weather: ${JSON.stringify(weatherForecast)}. Return JSON array: [{date, predictedSales, weatherDescription}]. Baseline $5500.`;
          const response = await generateContentSafe({ 
              model, 
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          responsePayload = { forecast: JSON.parse(response.text || '[]') };
          break;
      }
      
      case 'getVarianceAnalysis': {
          const { location, kpi, variance, allKpis } = payload;
          prompt = `Analyze ${variance > 0 ? 'positive' : 'negative'} variance of ${(variance * 100).toFixed(1)}% for ${kpi} at ${location}. Context: ${JSON.stringify(allKpis)}. 1 sentence cause, 1 sentence fix.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getInsights': {
          const { data, query } = payload;
          prompt = `Answer: "${query}" based on: ${JSON.stringify(data)}`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }
      
      case 'getTrendAnalysis': {
           const { historicalData } = payload;
           prompt = `Analyze trends: ${JSON.stringify(historicalData)}. 3 key patterns.`;
           const response = await generateContentSafe({ model, contents: prompt });
           responsePayload = { content: response.text };
           break;
      }

      case 'getDirectorPerformanceSnapshot': {
          const { directorName, directorData } = payload;
          prompt = `Performance snapshot for ${directorName} using: ${JSON.stringify(directorData)}.`;
          const response = await generateContentSafe({ model, contents: prompt });
          responsePayload = { content: response.text };
          break;
      }

      case 'getAnomalyDetections': {
          const { allStoresData } = payload;
          prompt = `Identify anomalies in: ${JSON.stringify(allStoresData)}. Return JSON array: [{id, location, kpi, deviation, summary, analysis}].`;
          const response = await generateContentSafe({ 
              model,
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          responsePayload = { anomalies: JSON.parse(response.text || '[]') };
          break;
      }

      case 'runWhatIfScenario': {
          const { data, userPrompt } = payload;
          prompt = `Model scenario: "${userPrompt}" on data: ${JSON.stringify(data)}. Return JSON: {analysis, args}.`;
          const response = await generateContentSafe({ 
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
    // Ensure we return a JSON error even for timeouts
    const statusCode = error.message.includes("Timed Out") ? 504 : 500;
    return { statusCode, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};