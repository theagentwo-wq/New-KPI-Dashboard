"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// V3 - Forcing redeployment to the correct project
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vertexai_1 = require("@google-cloud/vertexai");
// Initialize Firebase and Express
admin.initializeApp();
const app = (0, express_1.default)();
// --- Middleware ---
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// --- Helper Functions ---
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return "An unknown error occurred.";
};
// --- AI Content Generation ---
const generateAIContent = async (prompt, action) => {
    try {
        // Initialize Vertex AI with the project details from the environment
        const vertex_ai = new vertexai_1.VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
        const model = 'gemini-1.5-pro-latest';
        // Instantiate the generative model
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: {
                'maxOutputTokens': 8192,
                'temperature': 1,
                'topP': 0.95,
            },
            // Use Google Search for real-time, grounded results
            tools: [{
                    'googleSearchRetrieval': {},
                }],
        });
        const result = await generativeModel.generateContent(prompt);
        if (!result.response.candidates?.[0]?.content.parts[0]?.text) {
            console.error(`Vertex AI Error - Empty Response for action "${action}":`, JSON.stringify(result.response, null, 2));
            throw new Error('The AI model returned an empty or invalid response.');
        }
        const responseText = result.response.candidates[0].content.parts[0].text;
        return responseText;
    }
    catch (error) {
        console.error(`Vertex AI Error for action "${action}":`, error);
        if (error.message && error.message.includes("PERMISSION_DENIED")) {
            throw new Error("AI API Call Failed: The 'Vertex AI User' role is likely missing for the service account. Please check your project's IAM settings.");
        }
        // Re-throw the original error or a new one with more context
        throw new Error(`AI content generation failed for action: ${action}. Please check the server logs.`);
    }
};
// --- Main Gemini API Endpoint ---
app.post("/gemini", async (req, res) => {
    const { action, payload } = req.body;
    if (!action || !payload) {
        return res.status(400).json({ error: "Missing 'action' or 'payload'." });
    }
    let prompt = "";
    const { locationName } = payload;
    try {
        switch (action) {
            case "getReviewSummary":
                const { reviews } = payload;
                const reviewTexts = (reviews || []).map((r) => r.text).filter((text) => text?.trim()).join("\n---\n");
                if (!reviewTexts) {
                    return res.json({ content: "There are no written reviews available to analyze for this location." });
                }
                prompt = `As a restaurant operations analyst, summarize customer reviews for "${locationName}". Use Google Search to find recent reviews to supplement the provided data. Identify themes, positive feedback, and urgent improvement areas. Use clear headings. Reviews:\n${reviewTexts}`;
                break;
            case "getLocationMarketAnalysis":
                prompt = `Analyze the local market for the restaurant "${locationName}". Be detailed and actionable. Use Google Search to find current information on local events, holidays, news, and consumer trends. Include: 1. Upcoming Events & Holidays. 2. Current Market Trends. 3. Competitive Landscape. 4. Actionable Opportunities (3-5 specific, creative ideas).`;
                break;
            case "generateHuddleBrief":
                const { performanceData, audience, weather } = payload;
                const promotions = "Check company website for latest promotions.";
                const baseInfo = `- Location: ${locationName}\n- Weather: ${weather || "N/A"}\n- KPIs: ${performanceData || "N/A"}\n- Promotions: ${promotions}`;
                if (audience === "FOH") {
                    prompt = `Generate a fun, high-energy FOH pre-shift huddle brief for "${locationName}". Goal is to motivate, drive sales, and ensure an amazing guest experience. ${baseInfo}. Today's Focus: 1. Sales Contest (e.g., 'Sell the most XYZ to win!'). 2. Service Goal (e.g., 'Focus on 5-star reviews; mention review sites'). 3. Shift Game (e.g., 'Secret Compliment game is on!').`;
                }
                else if (audience === "BOH") {
                    prompt = `Generate a focused, passionate BOH pre-shift brief for "${locationName}" inspired by Anthony Bourdain. Goal is to culinary excellence and safety. ${baseInfo}. Today's Focus: 1. Kitchen Safety ('Work clean, work safe.'). 2. Health Standards ('If you wouldn't serve it to your family, don't serve it.'). 3. Passion & Pride ('Every plate has our signature. Make it count.').`;
                }
                else { // Managers
                    prompt = `Generate a strategic management pre-shift brief for "${locationName}". Goal is to align the team, drive profit, and foster culture. ${baseInfo}. Strategic Focus: 1. Floor Leadership ('Connect with 5 tables personally.'). 2. Cost Control ('Watch waste on the ABC dish.'). 3. Culture Initiative ('Publicly praise 3 team members today.').`;
                }
                break;
            case "getSalesForecast":
                const { historicalData, weatherForecast } = payload;
                prompt = `As a data analyst, create a 7-day sales forecast for "${locationName}". Use Google Search to find major upcoming local events or holidays. Use this, plus the provided weather, to create the forecast. Present as a simple, day-by-day list (e.g., "Monday: $XXXX (Sunny) - Increase due to local festival."). Data: Weather: ${JSON.stringify(weatherForecast)}, History: ${historicalData || "Use general restaurant sales patterns."}`;
                break;
            case "getMarketingIdeas":
                prompt = `Generate creative, actionable, local marketing ideas for the manager of "${locationName}". Use Google Search for current local trends and events. Provide ideas for different generations (Gen Z/Millennials, Gen X, Boomers) and budgets (Low/No, Moderate). Structure: For [Generation] ([Focus]): - *Low Budget:* [Idea]. - *Moderate Budget:* [Idea].`;
                break;
            default:
                return res.status(501).json({ error: `The action '${action}' is not implemented on the server.` });
        }
        const content = await generateAIContent(prompt, action);
        res.json({ content });
    }
    catch (error) {
        console.error(`Error in /gemini for action '${action}':`, error);
        res.status(500).json({ error: `Failed to process AI request for action: ${action}. Reason: ${getErrorMessage(error)}` });
    }
});
// --- Export the Express App ---
// The 'secrets' array is empty as Vertex AI authenticates automatically via Application Default Credentials.
// IMPORTANT: For this to work, the service account running this function 
// (usually {project-id}@appspot.gserviceaccount.com) MUST have the "Vertex AI User" IAM role.
exports.api = (0, https_1.onRequest)({ secrets: [] }, app);
//# sourceMappingURL=index.js.map