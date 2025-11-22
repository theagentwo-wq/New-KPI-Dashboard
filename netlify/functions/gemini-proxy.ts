// netlify/functions/gemini-proxy.ts
import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isHoliday } from '../../utils/dateUtils';

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to safely parse JSON from AI response
const safeJsonParse = (text: string, fallback: any, context: string) => {
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error(`Failed to parse JSON for ${context}:`, e);
    console.error('Raw text:', text);
    return fallback;
  }
};

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY missing');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // Helper to invoke background functions
  const invokeBackgroundFunction = (functionName: string, payload: any) => {
    const origin = new URL(event.rawUrl).origin;
    const url = `${origin}/.netlify/functions/${functionName}`;
    fetch(url, { method: 'POST', body: JSON.stringify({ payload }) }).catch(err =>
      console.error(`Error invoking ${functionName}:`, err)
    );
  };

  try {
    const { action, payload } = JSON.parse(event.body || '{}');
    if (!action) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing "action"' }) };
    }

    // Context enrichment (holidays)
    const today = new Date();
    const upcoming: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const name = isHoliday(d);
      if (name) upcoming.push(`${name} on ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`);
    }
    const holidayContext = upcoming.length
      ? `Upcoming Major US Holidays (next 30 days): ${upcoming.join(', ')}.`
      : 'No major US holidays in the next 30 days.';

    // Helper for safe generation with timeout using SDK
    const generateContentSafe = async (prompt: string, responseMimeType?: string) => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timed out')), 25000));
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const request = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: responseMimeType ? { responseMimeType } : undefined,
      });
      const result = await Promise.race([request, timeout]);
      // @ts-ignore – SDK returns a response object with .response.text()
      return { text: result.response.text() };
    };

    let prompt = '';
    let responsePayload: any = {};

    switch (action) {
      case 'chatWithStrategy': {
        const { context, userQuery, mode } = payload;
        let system = 'You are a helpful business strategy assistant.';
        if (mode === 'Financial') system = 'You are a strict CFO assistant. Focus on numbers, margins, and ROI.';
        if (mode === 'Operational') system = 'You are an Operations Director assistant. Focus on execution and efficiency.';
        if (mode === 'Marketing') system = 'You are a Marketing Strategist assistant. Focus on brand and growth.';
        prompt = `${system}\nCONTEXT:\n${context}\nUSER QUESTION:\n${userQuery}\nProvide a concise Markdown answer.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getExecutiveSummary': {
        const { data, view, periodLabel } = payload;
        prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Southern Kitchen for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs). Data:\n${JSON.stringify(data, null, 2)}`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getNoteTrends': {
        const { notes } = payload;
        prompt = `Analyze these notes and identify top 3 trends. Concise bullet points. Notes:\n${JSON.stringify(notes.map((n: any) => n.content))}`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'generateHuddleBrief': {
        const { location, storeData, audience, weather } = payload;
        const weatherCtx = weather ? `Today's weather forecast is: ${weather.temperature}°F, ${weather.shortForecast}.` : 'Weather information is not available.';
        prompt = `Create a pre‑shift huddle brief for the ${audience} team at ${location}.\nCONTEXT: Weather: ${weatherCtx}. Holidays: ${holidayContext}\nSTRUCTURE: Motivating Opener, Key Wins, Area of Focus, Team Action Item, Closing.\nData: ${JSON.stringify(storeData, null, 2)}`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getReviewSummary': {
        const { location } = payload;
        prompt = `Summarize typical online reviews for Tupelo Honey Southern Kitchen & Bar at ${location}. Include "Common Praises" and "Opportunities". Markdown format.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getLocationMarketAnalysis': {
        const { location } = payload;
        prompt = `Provide a market analysis for ${location}. Context: ${holidayContext}. Include: Local Vibe, Competitor Landscape, Upcoming Events. Markdown format.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getMarketingIdeas': {
        const { location } = payload;
        prompt = `Generate 3 marketing ideas for a restaurant in ${location}. Context: ${holidayContext}. Include: Title, Concept, Target Gen, Guerrilla Tactic.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getQuadrantAnalysis': {
        const { data, periodLabel, kpiAxes } = payload;
        prompt = `Analyze scatter plot data for "${periodLabel}". Y:${kpiAxes.y} Var, X:${kpiAxes.x} Var, Z:${kpiAxes.z} Actual. Data: ${JSON.stringify(data)}. Identify clusters.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getStrategicExecutiveAnalysis': {
        const { kpi, periodLabel, companyTotal, directorData, laggards } = payload;
        prompt = `CFO Analysis for ${kpi} in ${periodLabel}. Total: ${companyTotal}. Regional: ${JSON.stringify(directorData)}. Anchors: ${JSON.stringify(laggards)}. Provide Financial Impact, Leadership Focus, and Anchor Plan.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getSalesForecast': {
        const { location, weatherForecast } = payload;
        prompt = `Generate 7‑day sales forecast for ${location}. Weather: ${JSON.stringify(weatherForecast)}. Return JSON array: [{date, predictedSales, weatherDescription}]. Baseline $5500.`;
        const res = await generateContentSafe(prompt, 'application/json');
        responsePayload = { forecast: safeJsonParse(res.text, [], `Sales Forecast for ${location}`) };
        break;
      }
      case 'getVarianceAnalysis': {
        const { location, kpi, variance, allKpis } = payload;
        prompt = `Analyze ${variance > 0 ? 'positive' : 'negative'} variance of ${(variance * 100).toFixed(1)}% for ${kpi} at ${location}. Context: ${JSON.stringify(allKpis)}. 1 sentence cause, 1 sentence fix.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getInsights': {
        const { data, query } = payload;
        prompt = `Answer: "${query}" based on: ${JSON.stringify(data)}`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getTrendAnalysis': {
        const { historicalData } = payload;
        prompt = `Analyze trends: ${JSON.stringify(historicalData)}. 3 key patterns.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getDirectorPerformanceSnapshot': {
        const { directorName, directorData } = payload;
        prompt = `Performance snapshot for ${directorName} using: ${JSON.stringify(directorData)}.`;
        const res = await generateContentSafe(prompt);
        responsePayload = { content: res.text };
        break;
      }
      case 'getAnomalyDetections': {
        const { allStoresData } = payload;
        prompt = `Identify anomalies in: ${JSON.stringify(allStoresData)}. Return JSON array: [{id, location, kpi, deviation, summary, analysis}].`;
        const res = await generateContentSafe(prompt, 'application/json');
        responsePayload = { anomalies: safeJsonParse(res.text, [], `Anomaly Detections for period`) };
        break;
      }
      case 'runWhatIfScenario': {
        const { data, userPrompt } = payload;
        prompt = `Model scenario: "${userPrompt}" on data: ${JSON.stringify(data)}. Return JSON: {analysis, args}.`;
        const res = await generateContentSafe(prompt, 'application/json');
        responsePayload = safeJsonParse(res.text, {}, `What‑If Scenario for "${userPrompt}"`);
        break;
      }
      default:
        return { statusCode: 501, headers, body: JSON.stringify({ error: `Action '${action}' not implemented` }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(responsePayload) };
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    const msg = err.message?.includes('timed out')
      ? 'Gemini API request timed out. Please try again.'
      : err.message || 'Internal server error';
    return { statusCode: 200, headers, body: JSON.stringify({ error: msg, details: err.stack }) };
  }
};