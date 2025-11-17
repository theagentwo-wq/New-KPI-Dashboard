import { View, Anomaly, ForecastDataPoint, DailyForecast, Kpi, PerformanceData, Note } from '../types';

// FIX: All AI functionality has been moved to a Netlify proxy function to avoid exposing the API key on the client.
// This service now securely calls the proxy endpoint. This change resolves the client-side API key usage
// and the associated TypeScript error regarding the environment variable.

/**
 * Centralized function to call the Netlify proxy for all AI-related tasks.
 * @param action The specific AI function to execute on the backend.
 * @param payload The data required for the AI function.
 * @returns The JSON response from the proxy.
 */
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
            throw new Error(`AI Service Error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}

const AI_ERROR_MESSAGE = "An error occurred while connecting to the AI service.";

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    try {
        const result = await callAIApi('getExecutiveSummary', { data, view, periodLabel });
        return result.content || "Could not generate summary.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getInsights = async (data: any, view: View, periodLabel: string, query: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    try {
        const result = await callAIApi('getInsights', { data, view, periodLabel, query, userLocation });
        return result.content || "Could not get insights.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getTrendAnalysis = async (historicalData: any, view: View): Promise<string> => {
    try {
        const result = await callAIApi('getTrendAnalysis', { historicalData, view });
        return result.content || "Could not generate trend analysis.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: any): Promise<string> => {
    try {
        const result = await callAIApi('getDirectorPerformanceSnapshot', { directorName, periodLabel, directorData });
        return result.content || "Could not generate performance snapshot.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getAnomalyDetections = async (allStoresData: any, periodLabel: string): Promise<Anomaly[]> => {
    try {
        const result = await callAIApi('getAnomalyDetections', { allStoresData, periodLabel });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching anomaly detections:", error);
        return [];
    }
};

export const generateHuddleBrief = async (location: string, storeData: any, audience: string): Promise<string> => {
    try {
        const result = await callAIApi('generateHuddleBrief', { location, storeData, audience });
        return result.content || "Could not generate huddle brief.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
    try {
        const result = await callAIApi('runWhatIfScenario', { data, userPrompt });
        return result.data || { analysis: "Could not model the scenario at this time.", args: null };
    } catch (error) {
        console.error("Error in what-if scenario:", error);
        return { analysis: "Could not model the scenario at this time.", args: null };
    }
};

export const getSalesForecast = async (location: string, weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => {
    try {
        const result = await callAIApi('getSalesForecast', { location, weatherForecast });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching sales forecast:", error);
        return [];
    }
};

export const getReviewSummary = async (location: string): Promise<string> => {
    try {
        const result = await callAIApi('getReviewSummary', { location });
        return result.content || "Could not generate review summary.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getVarianceAnalysis = async (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    try {
        const result = await callAIApi('getVarianceAnalysis', { location, kpi, variance, allKpis });
        return result.content || "Could not analyze variance.";
    } catch (error) {
        console.error(error);
        return "Could not analyze variance.";
    }
};

export const getQuadrantAnalysis = async (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
    try {
        const result = await callAIApi('getQuadrantAnalysis', { data, periodLabel, kpiAxes });
        return result.content || "Could not generate quadrant analysis.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getLocationMarketAnalysis = async (location: string): Promise<string> => {
    try {
        const result = await callAIApi('getLocationMarketAnalysis', { location });
        return result.content || "Could not generate market analysis.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getMarketingIdeas = async (location: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    try {
        const result = await callAIApi('getMarketingIdeas', { location, userLocation });
        return result.content || "Could not generate marketing ideas.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};

export const getNoteTrends = async (notes: Note[]): Promise<string> => {
    try {
        const result = await callAIApi('getNoteTrends', { notes });
        return result.content || "Could not analyze note trends.";
    } catch (error) {
        console.error(error);
        return AI_ERROR_MESSAGE;
    }
};
