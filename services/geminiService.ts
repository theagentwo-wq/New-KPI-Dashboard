import { View, Anomaly, ForecastDataPoint, DailyForecast, Kpi, PerformanceData, Note } from '../types';

const PROXY_URL = '/.netlify/functions/gemini-proxy';
const PROXY_TIMEOUT_MS = 9500; // 9.5 seconds, under the 10s serverless limit

class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

async function callProxy(action: string, payload: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Proxy call failed for action "${action}":`, errorText);
            throw new Error(`The AI service failed to respond. Status: ${response.status}`);
        }
        
        return response.json();

    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new TimeoutError(`The AI analysis took too long to respond. This can happen with complex queries. Please try simplifying your request or try again later.`);
        }
        throw error; // Re-throw other errors
    }
}


const handleTextResponse = async (apiCall: Promise<any>): Promise<string> => {
    try {
        const result = await apiCall;
        return result.content || "AI service returned an unexpected response.";
    } catch (error: any) {
        console.error("Error in AI service call:", error);
        if (error instanceof TimeoutError) {
            return error.message;
        }
        return "AI features disabled. Could not connect to the AI service.";
    }
};

// --- Proxied Functions (for text-based AI) ---

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    return handleTextResponse(getExecutiveSummary.apiCall(data, view, periodLabel));
};
getExecutiveSummary.apiCall = (data: any, view: View, periodLabel: string) => callProxy('getExecutiveSummary', { data, view, periodLabel });


export const getInsights = async (
    data: any,
    view: View,
    periodLabel: string,
    query: string,
    userLocation?: { latitude: number; longitude: number } | null
): Promise<string> => {
    return handleTextResponse(getInsights.apiCall(data, view, periodLabel, query, userLocation));
};
getInsights.apiCall = (data: any, view: View, periodLabel: string, query: string, userLocation?: { latitude: number; longitude: number } | null) => callProxy('getInsights', { data, view, periodLabel, query, userLocation });


export const getTrendAnalysis = async (historicalData: any, view: View): Promise<string> => {
    return handleTextResponse(getTrendAnalysis.apiCall(historicalData, view));
};
getTrendAnalysis.apiCall = (historicalData: any, view: View) => callProxy('getTrendAnalysis', { historicalData, view });


export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: any): Promise<string> => {
     return handleTextResponse(getDirectorPerformanceSnapshot.apiCall(directorName, periodLabel, directorData));
};
getDirectorPerformanceSnapshot.apiCall = (directorName: string, periodLabel: string, directorData: any) => callProxy('getDirectorPerformanceSnapshot', { directorName, periodLabel, directorData });


export const getAnomalyDetections = async (allStoresData: any, periodLabel: string): Promise<Anomaly[]> => {
    try {
        const result = await callProxy('getAnomalyDetections', { allStoresData, periodLabel });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching anomaly detections:", error);
        return [];
    }
};

export const generateHuddleBrief = async (location: string, storeData: any, audience: string): Promise<string> => {
    return handleTextResponse(generateHuddleBrief.apiCall(location, storeData, audience));
};
generateHuddleBrief.apiCall = (location: string, storeData: any, audience: string) => callProxy('generateHuddleBrief', { location, storeData, audience });


export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
    try {
        const result = await callProxy('runWhatIfScenario', { data, userPrompt });
        return result.data || { analysis: "Could not model the scenario at this time.", args: null };
    } catch (error: any) {
        console.error("Error running what-if scenario:", error);
        if (error instanceof TimeoutError) {
             return { analysis: error.message, args: null };
        }
        return { analysis: "Could not model the scenario at this time.", args: null };
    }
};

export const getSalesForecast = async (location: string, weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => {
    try {
        const result = await callProxy('getSalesForecast', { location, weatherForecast });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching sales forecast:", error);
        return [];
    }
};

export const getReviewSummary = async (location: string): Promise<string> => {
    return handleTextResponse(getReviewSummary.apiCall(location));
};
getReviewSummary.apiCall = (location: string) => callProxy('getReviewSummary', { location });


export const getVarianceAnalysis = async (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    return handleTextResponse(getVarianceAnalysis.apiCall(location, kpi, variance, allKpis));
};
getVarianceAnalysis.apiCall = (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData) => callProxy('getVarianceAnalysis', { location, kpi, variance, allKpis });


export const getQuadrantAnalysis = async (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
     return handleTextResponse(getQuadrantAnalysis.apiCall(data, periodLabel, kpiAxes));
};
getQuadrantAnalysis.apiCall = (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }) => callProxy('getQuadrantAnalysis', { data, periodLabel, kpiAxes });


export const getLocationMarketAnalysis = async (location: string): Promise<string> => {
    return handleTextResponse(getLocationMarketAnalysis.apiCall(location));
};
getLocationMarketAnalysis.apiCall = (location: string) => callProxy('getLocationMarketAnalysis', { location });


export const getMarketingIdeas = async (location: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    return handleTextResponse(getMarketingIdeas.apiCall(location, userLocation));
};
getMarketingIdeas.apiCall = (location: string, userLocation?: { latitude: number; longitude: number } | null) => callProxy('getMarketingIdeas', { location, userLocation });

export const getNoteTrends = async (notes: Note[]): Promise<string> => {
    return handleTextResponse(getNoteTrends.apiCall(notes));
};
getNoteTrends.apiCall = (notes: Note[]) => callProxy('getNoteTrends', { notes });
