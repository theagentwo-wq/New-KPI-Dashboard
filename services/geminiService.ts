
import { callGeminiAPI } from '../lib/ai-client';
import { 
  Period, 
  View, 
  PerformanceData, 
  HistoricalData, 
  Weather, 
  Audience, 
  Kpi, 
  Note,
  Anomaly,
  AnalysisMode,
  ForecastDataPoint,
  DailyForecast,
  WeatherInfo
} from '../types';

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
  return callGeminiAPI('getReviewSummary', { location: locationName, reviews });
};

export const getLocationMarketAnalysis = (locationName: string) => {
  return callGeminiAPI('getLocationMarketAnalysis', { location: locationName });
};

export const generateHuddleBrief = (locationName: string, performanceData: PerformanceData, audience: Audience, weather: Weather | null): Promise<string> => {
  return callGeminiAPI('generateHuddleBrief', { location: locationName, storeData: performanceData, audience, weather });
};

export const getSalesForecast = (locationName: string, weatherForecast: DailyForecast[], historicalData: any): Promise<ForecastDataPoint[]> => {
    return callGeminiAPI('getSalesForecast', { location: locationName, weatherForecast, historicalData });
};

export const getMarketingIdeas = (locationName: string, userLocation: any) => {
    return callGeminiAPI('getMarketingIdeas', { location: locationName, userLocation });
};

export const runWhatIfScenario = (data: any, prompt: string): Promise<{ analysis: string, args?: any }> => {
  return callGeminiAPI('runWhatIfScenario', { data, userPrompt: prompt });
};

export const getNoteTrends = (notes: Note[]): Promise<string> => {
  return callGeminiAPI('getNoteTrends', { notes });
};

export const getAnomalyDetections = (allStoresData: any, periodLabel: string): Promise<Anomaly[]> => {
    return callGeminiAPI('getAnomalyDetections', { allStoresData, periodLabel });
};

export const getVarianceAnalysis = (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    return callGeminiAPI('getVarianceAnalysis', { location, kpi, variance, allKpis });
};

export const getQuadrantAnalysis = (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
    return callGeminiAPI('getQuadrantAnalysis', { data, periodLabel, kpiAxes });
};

export const getStrategicExecutiveAnalysis = (kpi: Kpi, periodLabel: string, companyTotal: number, directorData: any[], laggards: any[]): Promise<string> => {
    return callGeminiAPI('getStrategicExecutiveAnalysis', { kpi, periodLabel, companyTotal, directorData, laggards });
};

export const startStrategicAnalysisJob = (payload: { fileUrl: string, mimeType: string, fileName: string, filePath: string, mode: AnalysisMode }): Promise<{ jobId: string }> => {
    return callGeminiAPI('startStrategicAnalysis', payload);
};

export const chatWithStrategy = (context: string, userQuery: string, mode: AnalysisMode): Promise<string> => {
    return callGeminiAPI('chatWithStrategy', { context, userQuery, mode });
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
