import { View, Anomaly, ForecastDataPoint } from '../types';

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

export const getSalesForecast = async (location: string): Promise<ForecastDataPoint[]> => {
    try {
        const result = await callProxy('getSalesForecast', { location });
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

// FIX: Add generateVideo function to handle video generation via the proxy.
// This function orchestrates the multi-step process of starting, polling, and fetching the video.
export const generateVideo = async (
  prompt: string, 
  aspectRatio: '16:9' | '9:16', 
  setStatusMessage: (message: string) => void
): Promise<string> => {
  try {
    setStatusMessage('🎬 Kicking off video generation...');
    const initialOperation = await callProxy('generateVideoStart', { prompt, aspectRatio });

    let operation = initialOperation;
    let pollCount = 0;

    const messages = [
        '✨ Analyzing your prompt...',
        '🎨 Storyboarding the scenes...',
        '🤖 Teaching the pixels to dance...',
        '🔥 Rendering the frames...',
        '🎬 Finalizing the cut...',
        '🔊 Adding a touch of magic...'
    ];

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s polling interval
      setStatusMessage(messages[pollCount % messages.length]);
      pollCount++;
      operation = await callProxy('pollVideoOperation', { operation });
    }
    
    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error('Video generation finished but no video URI was found.');
    }

    setStatusMessage('✅ Generation complete! Downloading video...');
    const downloadLink = operation.response.generatedVideos[0].video.uri;
    const videoData = await callProxy('fetchVideo', { uri: downloadLink });

    return videoData.url;
  } catch (error: any) {
    console.error('Video generation process failed:', error);
    throw error;
  }
};