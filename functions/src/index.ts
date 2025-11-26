
import { https, logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { GEMINI_API_KEY } from './config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

initializeApp();

const MODEL_CONFIG = {
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
};

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- Gemini API ---    
const callGeminiAPI = async (prompt: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", ...MODEL_CONFIG, safetySettings: SAFETY_SETTINGS });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

// --- Function Handlers ---   
const handlers: Record<string, (data: any) => Promise<any>> = {
    getInsights: async ({ data, view, period, prompt }) => {
        const p = `Analyze this data for ${view} during ${period}: ${JSON.stringify(data)}. Focus on: ${prompt}`;
        return await callGeminiAPI(p);
    },
    getExecutiveSummary: async ({ data, view, period }) => {
        const p = `Executive summary for ${view} (${period.startDate} to ${period.endDate}): ${JSON.stringify(data)}`;
        return await callGeminiAPI(p);
    },
    getReviewSummary: async ({ location }) => {
        const p = `Summarize recent customer reviews for ${location}.`;
        return await callGeminiAPI(p);
    },
    getLocationMarketAnalysis: async ({ location }) => {
        const p = `Provide a market analysis for a new store in ${location}, considering demographics and competition.`;
        return await callGeminiAPI(p);
    },
    generateHuddleBrief: async ({ location, storeData, audience, weather }) => {
        const p = `Generate a huddle brief for ${audience} at ${location}. Data: ${JSON.stringify(storeData)}. Weather: ${JSON.stringify(weather)}`;
        return await callGeminiAPI(p);
    },
    getSalesForecast: async ({ location, weatherForecast, historicalData }) => {
        const p = `Forecast sales for ${location} given historical data: ${JSON.stringify(historicalData)} and weather: ${JSON.stringify(weatherForecast)}`;
        return await callGeminiAPI(p);
    },
    getMarketingIdeas: async ({ location, userLocation }) => {
        const p = `Suggest marketing ideas for ${location}, near ${JSON.stringify(userLocation)}.`;
        return await callGeminiAPI(p);
    },
    getNoteTrends: async ({ notes }) => {
        const p = `Analyze these notes for trends: ${JSON.stringify(notes)}`;
        return await callGeminiAPI(p);
    },
    getAnomalyDetections: async ({ allStoresData, periodLabel }) => {
        const p = `Find anomalies in this data for ${periodLabel}: ${JSON.stringify(allStoresData)}`;
        return await callGeminiAPI(p);
    },
    getAnomalyInsights: async ({ anomaly, data }) => {
        const p = `Explain this anomaly: ${JSON.stringify(anomaly)}. Context: ${JSON.stringify(data)}`;
        return await callGeminiAPI(p);
    },
    getVarianceAnalysis: async ({ location, kpi, variance, allKpis }) => {
        const p = `Explain the ${variance}% variance in ${kpi} for ${location}. Data: ${JSON.stringify(allKpis)}`;
        return await callGeminiAPI(p);
    },
    runWhatIfScenario: async ({ data, prompt }) => {
        const p = `Model this 'what-if' scenario: ${prompt}. Data: ${JSON.stringify(data)}`;
        return await callGeminiAPI(p);
    },
    startStrategicAnalysisJob: async (payload) => {
        const { mode, period, view, filePath } = payload;
        const p = `Start a ${mode} analysis for ${view} (${period.startDate} to ${period.endDate}) using file: ${filePath}.`;
        const result = await callGeminiAPI(p);
        return { result, jobId: `job_${Date.now()}` };
    },
    chatWithStrategy: async ({ context, userQuery, mode }) => {
        const p = `Context (${mode}): ${context}. Question: ${userQuery}.`;
        return await callGeminiAPI(p);
    },
    getStrategicExecutiveAnalysis: async (data) => {
        const p = `Strategic analysis: ${JSON.stringify(data)}`;
        return await callGeminiAPI(p);
    },
    startTask: async (data) => {
        logger.info('Starting task with data:', data);
        return { id: `task_${Date.now()}` };
    }
};

export const api = https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const functionName = req.path.split('/').pop();
            if (functionName && handlers[functionName]) {
                const result = await handlers[functionName](req.body.data);
                res.json({ data: result });
            } else {
                res.status(404).send('Function not found');
            }
        } catch (err) {
            logger.error('API Error:', err);
            let message = 'An unexpected error occurred.';
            if (err instanceof Error) {
                message = err.message;
            }
            res.status(500).json({ error: message });
        }
    });
});
