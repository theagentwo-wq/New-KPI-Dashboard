import { View, Anomaly, ForecastDataPoint, DailyForecast, Kpi, PerformanceData, Note } from '../types';
import { marked } from 'marked';

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
            const errorBody = await response.json().catch(() => ({ error: 'Proxy request failed' }));
            console.error(`API Proxy Error (${response.status}):`, errorBody);
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error calling AI API proxy for action "${action}":`, error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}

export const extractKpisFromDocument = async (fileData: { mimeType: string, data: string }, fileName: string): Promise<any[]> => {
    try {
        const result = await callAIApi('extractKpisFromDocument', { fileData, fileName });
        return result.data || [];
    } catch (error) {
        console.error("Error extracting KPIs from document:", error);
        throw error;
    }
};

export const extractKpisFromText = async (text: string): Promise<any[]> => {
    try {
        const result = await callAIApi('extractKpisFromText', { text });
        return result.data || [];
    } catch (error) {
        console.error("Error extracting KPIs from text:", error);
        throw error;
    }
}

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
    const result = await callAIApi('getPlaceDetails', { address });
    return result.data;
};

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    const result = await callAIApi('getExecutiveSummary', { data, view, periodLabel });
    return result.content || "Could not generate summary.";
};

export const getNoteTrends = async (notes: Note[]): Promise<string> => {
    const result = await callAIApi('getNoteTrends', { notes });
    return result.content || "Could not analyze note trends.";
};

// --- Placeholder/Stub Functions ---
// FIX: Prefixed unused parameters with '_' to resolve TS6133 errors and allow deployment.
export const getInsights = async (_data: any, _view: View, _periodLabel: string, _query: string, _userLocation?: { latitude: number; longitude: number } | null): Promise<string> => { return "AI Insights are not implemented in this version."; };
export const getTrendAnalysis = async (_historicalData: { periodLabel: string; data: PerformanceData }[], _view: View): Promise<string> => { return "Trend Analysis is not implemented in this version."; };
export const getDirectorPerformanceSnapshot = async (_directorName: string, _periodLabel: string, _directorData: any): Promise<string> => { return "Director Snapshot is not implemented in this version."; };
export const getAnomalyDetections = async (_allStoresData: any, _periodLabel: string): Promise<Anomaly[]> => { return []; };
export const generateHuddleBrief = async (_location: string, _storeData: any, _audience: string): Promise<string> => { return "Huddle Brief generation is not implemented in this version."; };
export const runWhatIfScenario = async (_data: any, _userPrompt: string): Promise<{ analysis: string, args?: any }> => { return { analysis: "Scenario Modeling is not implemented in this version." }; };
export const getSalesForecast = async (_location: string, _weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => { return []; };
export const getReviewSummary = async (_location: string): Promise<string> => { return "Review Summary is not implemented in this version."; };
export const getVarianceAnalysis = async (_location: string, _kpi: Kpi, _variance: number, _allKpis: PerformanceData): Promise<string> => { return "Variance Analysis is not implemented in this version."; };
export const getQuadrantAnalysis = async (_data: any[], _periodLabel: string, _kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => { return "Quadrant Analysis is not implemented in this version."; };
export const getLocationMarketAnalysis = async (_location: string): Promise<string> => { return "Market Analysis is not implemented in this version."; };
export const getMarketingIdeas = async (_location: string, _userLocation?: { latitude: number; longitude: number } | null): Promise<string> => { return "Marketing Ideas feature is not implemented in this version."; };