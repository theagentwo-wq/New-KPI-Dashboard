"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const config_1 = require("./config");
const generative_ai_1 = require("@google/generative-ai");
const cors = require("cors");
const corsHandler = cors({ origin: true });
(0, app_1.initializeApp)();
const MODEL_CONFIG = {
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
};
const SAFETY_SETTINGS = [
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.GEMINI_API_KEY);
// --- Gemini API ---    
const callGeminiAPI = async (prompt) => {
    const model = genAI.getGenerativeModel(Object.assign(Object.assign({ model: "gemini-1.5-flash" }, MODEL_CONFIG), { safetySettings: SAFETY_SETTINGS }));
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};
// --- Function Handlers ---   
const handlers = {
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
        firebase_functions_1.logger.info('Starting task with data:', data);
        return { id: `task_${Date.now()}` };
    }
};
exports.api = firebase_functions_1.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const functionName = req.path.split('/').pop();
            if (functionName && handlers[functionName]) {
                const result = await handlers[functionName](req.body.data);
                res.json({ data: result });
            }
            else {
                res.status(404).send('Function not found');
            }
        }
        catch (err) {
            firebase_functions_1.logger.error('API Error:', err);
            let message = 'An unexpected error occurred.';
            if (err instanceof Error) {
                message = err.message;
            }
            res.status(500).json({ error: message });
        }
    });
});
//# sourceMappingURL=index.js.map