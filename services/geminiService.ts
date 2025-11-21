import { View, Anomaly, ForecastDataPoint, DailyForecast, Kpi, PerformanceData, Note, WeatherInfo, StrategicAnalysisData } from '../types';

export interface PlaceDetails {
    name: string;
    rating: number;
    photoUrls: string[];
}

async function callAIApi(action: string, payload: any): Promise<any> {
    try {
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            console.error(`API Proxy Error (${response.status}):`, errorBody);
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error calling AI API proxy for action "${action}":`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}

export const startStrategicAnalysisJob = async (payload: { fileUrl: string, mimeType: string, fileName: string, filePath: string }): Promise<{ jobId: string }> => {
    const result = await callAIApi('startStrategicAnalysis', payload);
    return result; 
};

export const startImportJob = async (payload: any, jobType: 'document' | 'text'): Promise<{ jobId: string }> => {
    try {
        const result = await callAIApi('startImportJob', { ...payload, jobType });
        return result;
    } catch (error) {
        console.error(`Error starting import job for ${jobType}:`, error);
        throw error;
    }
};

export const deleteImportFile = async (filePath: string): Promise<void> => {
    try {
        await callAIApi('deleteFile', { filePath });
    } catch (error) {
        console.warn(`Could not delete temporary import file: ${filePath}`, error);
        // Do not re-throw, this is a non-critical cleanup step
    }
};

export const getMapsApiKey = async (): Promise<string> => {
    try {
        const response = await fetch('/.netlify/functions/maps-api-key-proxy');
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to fetch Maps API key');
        }
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error("Error fetching Maps API key:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching the Maps API key.');
    }
};

export const getPlaceDetails = async (address: string): Promise<PlaceDetails> => {
    // REFACTOR: Call the new, dedicated maps-proxy for reliability.
    try {
        const response = await fetch('/.netlify/functions/maps-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            console.error(`Maps Proxy Error (${response.status}):`, errorBody);
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Error calling Maps API proxy:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while contacting the mapping service.');
    }
};

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    const result = await callAIApi('getExecutiveSummary', { data, view, periodLabel });
    return result.content || "Could not generate summary.";
};

export const getNoteTrends = async (notes: Note[]): Promise<string> => {
    const result = await callAIApi('getNoteTrends', { notes });
    return result.content || "Could not analyze note trends.";
};

// --- Full AI Implementations ---

export const getInsights = async (data: any, view: View, periodLabel: string, query: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    const result = await callAIApi('getInsights', { data, view, periodLabel, query, userLocation });
    return result.content || "AI could not process this request.";
};
export const getTrendAnalysis = async (historicalData: { periodLabel: string; data: PerformanceData }[], view: View): Promise<string> => {
    const result = await callAIApi('getTrendAnalysis', { historicalData, view });
    return result.content || "Could not generate trend analysis.";
};
export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: any): Promise<string> => {
    const result = await callAIApi('getDirectorPerformanceSnapshot', { directorName, periodLabel, directorData });
    return result.content || "Could not generate director snapshot.";
};
export const getAnomalyDetections = async (allStoresData: any, periodLabel: string): Promise<Anomaly[]> => {
    const result = await callAIApi('getAnomalyDetections', { allStoresData, periodLabel });
    return result.anomalies || [];
};
// FIX: Update function signature to accept weather info, matching backend expectations.
export const generateHuddleBrief = async (location: string, storeData: any, audience: string, weather: WeatherInfo | null): Promise<string> => {
    const result = await callAIApi('generateHuddleBrief', { location, storeData, audience, weather });
    return result.content || "Could not generate huddle brief.";
};
export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
    const result = await callAIApi('runWhatIfScenario', { data, userPrompt });
    return result || { analysis: "Could not model this scenario." };
};
export const getSalesForecast = async (location: string, weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => {
    const result = await callAIApi('getSalesForecast', { location, weatherForecast });
    return result.forecast || [];
};
export const getReviewSummary = async (location: string): Promise<string> => {
    const result = await callAIApi('getReviewSummary', { location });
    return result.content || "Could not generate review summary.";
};
export const getVarianceAnalysis = async (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    const result = await callAIApi('getVarianceAnalysis', { location, kpi, variance, allKpis });
    return result.content || "Could not analyze variance.";
};
export const getQuadrantAnalysis = async (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
    const result = await callAIApi('getQuadrantAnalysis', { data, periodLabel, kpiAxes });
    return result.content || "Could not generate quadrant analysis.";
};
export const getStrategicExecutiveAnalysis = async (kpi: Kpi, periodLabel: string, companyTotal: number, directorData: any[], laggards: any[]): Promise<string> => {
    const result = await callAIApi('getStrategicExecutiveAnalysis', { kpi, periodLabel, companyTotal, directorData, laggards });
    return result.content || "Could not generate executive analysis.";
};
export const getLocationMarketAnalysis = async (location: string): Promise<string> => {
    const result = await callAIApi('getLocationMarketAnalysis', { location });
    return result.content || "Could not generate market analysis.";
};
export const getMarketingIdeas = async (location: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    const result = await callAIApi('getMarketingIdeas', { location, userLocation });
    return result.content || "Could not generate marketing ideas.";
};