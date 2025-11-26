import { callGeminiAPI } from '../lib/ai-client';
import { Period, View, PerformanceData, Note, Anomaly, AnalysisMode, FileUploadResult, Audience, Weather, Kpi, ForecastDataPoint, DailyForecast, DataItem } from '../types';

export const getInsights = (data: Record<string, DataItem>, view: View, period: string, prompt: string): Promise<any> => {
  return callGeminiAPI('getInsights', { data, view, period, prompt });
};

export const getExecutiveSummary = (data: { [key: string]: DataItem }, view: View, period: Period): Promise<string> => {
  return callGeminiAPI('gemini', { data, view, period });
};

export const getReviewSummary = (locationName: string): Promise<any> => {
  return callGeminiAPI('getReviewSummary', { location: locationName });
};

export const getLocationMarketAnalysis = (locationName: string): Promise<any> => {
  return callGeminiAPI('getLocationMarketAnalysis', { location: locationName });
};

export const generateHuddleBrief = (locationName: string, performanceData: PerformanceData, audience: Audience, weather: Weather | null): Promise<string> => {
  return callGeminiAPI('generateHuddleBrief', { location: locationName, storeData: performanceData, audience, weather });
};

export const getSalesForecast = (locationName: string, weatherForecast: DailyForecast[] | null, historicalData: any): Promise<ForecastDataPoint[]> => {
    return callGeminiAPI('getSalesForecast', { location: locationName, weatherForecast, historicalData });
};

export const getMarketingIdeas = (locationName: string, userLocation: { latitude: number, longitude: number } | null): Promise<any> => {
    return callGeminiAPI('getMarketingIdeas', { location: locationName, userLocation });
};

export const getNoteTrends = (notes: Note[]): Promise<string> => {
  return callGeminiAPI('getNoteTrends', { notes });
};

export const getAnomalyDetections = (allStoresData: Record<string, DataItem>, periodLabel: string): Promise<Anomaly[]> => {
    return callGeminiAPI('getAnomalyDetections', { allStoresData, periodLabel });
};

export const getAnomalyInsights = (anomaly: Anomaly, data: Record<string, DataItem>): Promise<string> => {
    return callGeminiAPI('getAnomalyInsights', { anomaly, data });
};

export const getVarianceAnalysis = (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    return callGeminiAPI('getVarianceAnalysis', { location, kpi, variance, allKpis });
};

export const runWhatIfScenario = (data: any, prompt: string): Promise<{ analysis: string, args?: any } | null> => {
  return callGeminiAPI('runWhatIfScenario', { data, prompt });
};

export const startStrategicAnalysisJob = (payload: FileUploadResult, mode: AnalysisMode, period: Period, view: View): Promise<{ jobId: string }> => {
    return callGeminiAPI('startStrategicAnalysis', { ...payload, mode, period, view });
};

export const chatWithStrategy = (context: string, userQuery: string, mode: AnalysisMode): Promise<string> => {
    return callGeminiAPI('chatWithStrategy', { context, userQuery, mode });
};

export const getStrategicExecutiveAnalysis = (
    kpi: Kpi,
    period: string,
    companyTotal: string,
    directorPerformance: { name: string, value: string }[],
    anchorStores: { store: string, value: string }[]
): Promise<string> => {
    return callGeminiAPI('getStrategicExecutiveAnalysis', {
        kpi,
        period,
        companyTotal,
        directorPerformance,
        anchorStores
    });
};

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

    if (!result || !result.id) {
        throw new Error('Failed to get job ID from AI service.');
    }
    return { jobId: result.id };
  } catch (error) {
    console.error('Error starting Gemini import job:', error);
    throw new Error('Failed to start the AI analysis job.');
  }
};

export const deleteImportFile = async (filePath: string): Promise<void> => {
  console.warn(
    `[INFO] File deletion requested for: ${filePath}. This is a placeholder.`
  );
  return Promise.resolve();
};