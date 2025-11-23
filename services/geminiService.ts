
import { callGeminiAPI } from '../lib/ai-client';
import { Period, View, PerformanceData, HistoricalData, Weather, Audience, Kpi } from '../types';

// Note: The 'generativeAI' client from the original file has been replaced
// by the 'callGeminiAPI' proxy to ensure all calls go through our secure backend.

/**
 * A service layer for all interactions with the Gemini AI API.
 * It uses a proxy (`callGeminiAPI`) to securely communicate with the backend.
 */

export const getInsights = (data: any, view: View, periodLabel: string, query: string, userLocation: any) => {
  return callGeminiAPI('getInsights', { data, view, periodLabel, query, userLocation });
};

export const getTrendAnalysis = (historicalData: HistoricalData[], view: View) => {
  return callGeminiAPI('getTrendAnalysis', { historicalData, view });
};

export const getDirectorPerformanceSnapshot = (directorName: string, periodLabel: string, aggregateData: PerformanceData) => {
  return callGeminiAPI('getDirectorPerformanceSnapshot', { directorName, periodLabel, aggregateData });
};

export const getExecutiveSummary = (data: any, view: View, periodLabel: string) => {
  return callGeminiAPI('getExecutiveSummary', { data, view, periodLabel });
};

export const getReviewSummary = (locationName: string, reviews: any[]) => {
  return callGeminiAPI('getReviewSummary', { locationName, reviews });
};

export const getLocationMarketAnalysis = (locationName: string) => {
  return callGeminiAPI('getLocationMarketAnalysis', { locationName });
};

export const generateHuddleBrief = (locationName: string, performanceData: PerformanceData, audience: Audience, weather: Weather | null) => {
  return callGeminiAPI('generateHuddleBrief', { locationName, performanceData, audience, weather });
};

export const getSalesForecast = (locationName: string, weatherForecast: any, historicalData: any) => {
    return callGeminiAPI('getSalesForecast', { locationName, weatherForecast, historicalData });
};

export const getMarketingIdeas = (locationName: string, userLocation: any) => {
    return callGeminiAPI('getMarketingIdeas', { locationName, userLocation });
};

// --- Import Job Functions (from original file, kept for compatibility) ---

interface FileUploadResult {
  filePath: string;
  uploadId: string;
  mimeType: string;
  fileName: string;
}

export const startImportJob = async (file: FileUploadResult, importType: 'document' | 'text'): Promise<{ jobId: string }> => {
  try {
    const result = await callGeminiAPI('startTask', {
      model: 'gemini-1.5-pro-latest',
      prompt: `
        Analyze the provided ${importType} and extract financial data.
        - You are a financial analyst reviewing a document.
        - Your task is to extract all relevant information and structure it as JSON.
        - The output should be a JSON object with a single key: "results".
        - The "results" key should contain an array of objects, where each object represents a distinct data set (e.g., "Actuals" or "Budgets").
        - Each data set object must have the following properties:
          - "dataType": "Actuals" | "Budget"
          - "sourceName": string (e.g., the original file name or sheet)
          - "data": an array of objects, where each object is a row from the source.
        - If you cannot determine the data type, classify it as "Actuals".
      `,
      files: [{
        filePath: file.filePath,
        mimeType: file.mimeType,
        displayName: file.fileName,
      }],
      taskType: 'batch',
    });

    const jobId = result.id;
    if (!jobId) {
      throw new Error('Failed to get job ID from AI service.');
    }
    return { jobId };
  } catch (error) {
    console.error('Error starting Gemini import job:', error);
    throw new Error('Failed to start the AI analysis job.');
  }
};

export const deleteImportFile = async (filePath: string): Promise<void> => {
  console.warn(
    `[INFO] File deletion requested for: ${filePath}. This is a placeholder.`
  );
  // In a real implementation, this would call a secure backend endpoint.
  // await callGeminiAPI('deleteFile', { filePath });
  return Promise.resolve();
};

