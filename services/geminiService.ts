import { View, Anomaly, ForecastDataPoint, DailyForecast, Kpi, PerformanceData } from '../types';

const PROXY_URL = '/.netlify/functions/gemini-proxy';

async function callProxy(action: string, payload: any) {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Proxy call failed for action "${action}":`, errorText);
        throw new Error(`The AI service failed to respond. Status: ${response.status}`);
    }
    
    return response.json();
}

// --- Proxied Functions (for text-based AI) ---

export const getExecutiveSummary = async (data: any, view: View, periodLabel: string): Promise<string> => {
    try {
        const result = await callProxy('getExecutiveSummary', { data, view, periodLabel });
        return result.content || "AI features disabled. Could not connect to the AI service.";
    } catch (error) {
        console.error("Error fetching executive summary:", error);
        return "AI features disabled. Could not connect to the AI service.";
    }
};

export const getInsights = async (
    data: any,
    view: View,
    periodLabel: string,
    query: string,
    userLocation?: { latitude: number; longitude: number } | null
): Promise<string> => {
    try {
        const result = await callProxy('getInsights', { data, view, periodLabel, query, userLocation });
        return result.content || "I'm sorry, I couldn't process that request.";
    } catch (error) {
        console.error("Error fetching insights:", error);
        return "I'm sorry, I couldn't process that request.";
    }
};

export const getTrendAnalysis = async (historicalData: any, view: View): Promise<string> => {
    try {
        const result = await callProxy('getTrendAnalysis', { historicalData, view });
        return result.content || "Could not generate trend analysis at this time.";
    } catch (error) {
        console.error("Error fetching trend analysis:", error);
        return "Could not generate trend analysis at this time.";
    }
};

export const getDirectorPerformanceSnapshot = async (directorName: string, periodLabel: string, directorData: any): Promise<string> => {
    try {
        const result = await callProxy('getDirectorPerformanceSnapshot', { directorName, periodLabel, directorData });
        return result.content || "Could not generate performance snapshot at this time.";
    } catch (error) {
        console.error("Error fetching director snapshot:", error);
        return "Could not generate performance snapshot at this time.";
    }
};

export const getAnomalyDetections = async (allStoresData: any, periodLabel: string): Promise<Anomaly[]> => {
    try {
        const result = await callProxy('getAnomalyDetections', { allStoresData, periodLabel });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching anomaly detections:", error);
        return [];
    }
};

export const generateHuddleBrief = async (location: string, storeData: any): Promise<string> => {
    try {
        const result = await callProxy('generateHuddleBrief', { location, storeData });
        return result.content || "Could not generate huddle brief at this time.";
    } catch (error) {
        console.error("Error generating huddle brief:", error);
        return "Could not generate huddle brief at this time.";
    }
};

export const runWhatIfScenario = async (data: any, userPrompt: string): Promise<{ analysis: string, args?: any }> => {
    try {
        const result = await callProxy('runWhatIfScenario', { data, userPrompt });
        return result.data || { analysis: "Could not model the scenario at this time.", args: null };
    } catch (error) {
        console.error("Error running what-if scenario:", error);
        return { analysis: "Could not model the scenario at this time.", args: null };
    }
};

export const getSalesForecast = async (location: string, weatherForecast: DailyForecast[]): Promise<ForecastDataPoint[]> => {
    try {
        const result = await callProxy('getSalesForecast', { location, weatherForecast });
        return result.data || [];
    } catch (error) {
        console.error("Error fetching sales forecast:", error);
        // Fallback to mock data on error
        const today = new Date();
        return Array.from({ length: 7 }).map((_, i) => ({
            date: new Date(new Date().setDate(today.getDate() + i)).toISOString().split('T')[0],
            predictedSales: 50000 + Math.random() * 10000
        }));
    }
};

export const getReviewSummary = async (location: string): Promise<string> => {
    try {
        const result = await callProxy('getReviewSummary', { location });
        return result.content || "Could not generate a review summary at this time.";
    } catch (error) {
        console.error("Error fetching review summary:", error);
        return "Could not generate a review summary at this time.";
    }
};

export const getVarianceAnalysis = async (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    try {
        const result = await callProxy('getVarianceAnalysis', { location, kpi, variance, allKpis });
        return result.content || "Could not provide analysis.";
    } catch (error) {
        console.error("Error fetching variance analysis:", error);
        return "Could not provide analysis.";
    }
};

export const getQuadrantAnalysis = async (data: any[], periodLabel: string, kpiAxes: { x: Kpi, y: Kpi, z: Kpi }): Promise<string> => {
    try {
        const result = await callProxy('getQuadrantAnalysis', { data, periodLabel, kpiAxes });
        return result.content || "Could not generate quadrant analysis at this time.";
    } catch (error) {
        console.error("Error fetching quadrant analysis:", error);
        return "Could not generate quadrant analysis at this time.";
    }
};

export const getLocationMarketAnalysis = async (location: string): Promise<string> => {
    try {
        const result = await callProxy('getLocationMarketAnalysis', { location });
        return result.content || "Could not generate a market analysis at this time.";
    } catch (error) {
        console.error("Error fetching market analysis:", error);
        return "Could not generate a market analysis at this time.";
    }
};

export const getMarketingIdeas = async (location: string, userLocation?: { latitude: number; longitude: number } | null): Promise<string> => {
    try {
        const result = await callProxy('getMarketingIdeas', { location, userLocation });
        return result.content || "Could not generate marketing ideas at this time.";
    } catch (error) {
        console.error("Error fetching marketing ideas:", error);
        return "Could not generate marketing ideas at this time.";
    }
};
