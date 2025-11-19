
import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
import { createAnalysisJob, createImportJob } from '../../services/firebaseService';
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

        // Fire-and-forget invocation of the background function.
        fetch(functionUrl, {
            method: 'POST',
            body: JSON.stringify({ payload })
        }).catch(err => {
            console.error(`Error invoking background function '${functionName}':`, err);
        });
    };

    switch (action) {
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
          // This synchronous action is for cleanup. It is currently a stub
          // as the background jobs handle their own file deletion.
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      default:
        // This handles simple, synchronous requests like Executive Summary, Note Trends etc.
        const { data, view, periodLabel, notes } = payload;
        
        let prompt;
        if (action === 'getNoteTrends' && notes) {
            prompt = `You are an expert operations analyst for a restaurant group. Analyze these notes and identify the top 3-4 recurring themes or trends. Provide the output as a concise, bulleted list in Markdown. Notes:\n${JSON.stringify(notes.map((n:any) => n.content))}`;
        } else {
            prompt = `You are an expert restaurant operations analyst. Analyze the following aggregated KPI data for Tupelo Honey Cafe for the period "${periodLabel}" and the view "${view}". Provide a concise executive summary (2-3 paragraphs) highlighting the most significant wins, challenges, and key areas for focus. The data represents director-level aggregates. Your analysis should be sharp, insightful, and tailored for an executive audience. Data:\n${JSON.stringify(data, null, 2)}`;
        }
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return { statusCode: 200, headers, body: JSON.stringify({ content: response.text }) };
    }
  } catch (error: any) {
    console.error('Error in Gemini proxy:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};
