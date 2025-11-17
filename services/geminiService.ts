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
            // The service name is already in the error from the proxy, so we just re-throw.
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}

const getDetailedErrorMessage = (error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error);
    // Add a clear prefix to identify the source of the error in the UI.
    return `[AI Service Error] ${message}`;
};

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    try {
        const result = await callAIApi('getExecutiveSummary', { data, view, periodLabel });
        return result.content || "Could not generate summary.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getInsights = async (data: any, view: View, periodLabel: string, query: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    try {
        const result = await callAIApi('getInsights', { data, view, periodLabel, query, userLocation });
        return result.content || "Could not get insights.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getTrendAnalysis = async (historicalData: any, view: View): Promise<string> => {
    try {
        const result = await callAIApi('getTrendAnalysis', { historicalData, view });
        return result.content || "Could not generate trend analysis.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: any): Promise<string> => {
    try {
        const result = await callAIApi('getDirectorPerformanceSnapshot', { directorName, periodLabel, directorData });
        return result.content || "Could not generate performance snapshot.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
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
        return getDetailedErrorMessage(error);
    }
};

export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
    try {
        const result = await callAIApi('runWhatIfScenario', { data, userPrompt });
        return result.data || { analysis: "Could not model the scenario at this time.", args: null };
    } catch (error) {
        console.error("Error in what-if scenario:", error);
        return { analysis: getDetailedErrorMessage(error), args: null };
    }
};

export const getSalesForecast = async (location: string, weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => {
    try {
        const result = await callAIApi('getSalesForecast', { location, weatherForecast });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching sales forecast:", error);
        // We can't return a string here, so we return an empty array. The console log will show the error.
        return [];
    }
};

export const getReviewSummary = async (location: string): Promise<string> => {
    try {
        const result = await callAIApi('getReviewSummary', { location });
        return result.content || "Could not generate review summary.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getVarianceAnalysis = async (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    try {
        const result = await callAIApi('getVarianceAnalysis', { location, kpi, variance, allKpis });
        return result.content || "Could not analyze variance.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getQuadrantAnalysis = async (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
    try {
        const result = await callAIApi('getQuadrantAnalysis', { data, periodLabel, kpiAxes });
        return result.content || "Could not generate quadrant analysis.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getLocationMarketAnalysis = async (location: string): Promise<string> => {
    try {
        const result = await callAIApi('getLocationMarketAnalysis', { location });
        return result.content || "Could not generate market analysis.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getMarketingIdeas = async (location: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    try {
        const result = await callAIApi('getMarketingIdeas', { location, userLocation });
        return result.content || "Could not generate marketing ideas.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};

export const getNoteTrends = async (notes: Note[]): Promise<string> => {
    try {
        const result = await callAIApi('getNoteTrends', { notes });
        return result.content || "Could not analyze note trends.";
    } catch (error) {
        console.error(error);
        return getDetailedErrorMessage(error);
    }
};
