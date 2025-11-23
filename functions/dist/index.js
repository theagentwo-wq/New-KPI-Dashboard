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
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const generative_ai_1 = require("@google/generative-ai");
// Initialize Firebase and Express
admin.initializeApp();
const app = (0, express_1.default)();
// --- Middleware ---
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// --- Helper Functions ---
const getApiKey = (keyName) => {
    const key = process.env[keyName];
    if (!key)
        throw new Error(`Server configuration error: Secret ${keyName} is not set.`);
    return key;
};
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return "An unknown error occurred.";
};
// --- Route Handlers ---
// Maps API Endpoint
const mapsClient = new google_maps_services_js_1.Client({});
app.post("/maps/place-details", async (req, res) => {
    const { searchQuery } = req.body;
    if (!searchQuery) {
        return res.status(400).json({ error: "Missing 'searchQuery' in request body." });
    }
    try {
        const MAPS_API_KEY = getApiKey("MAPS_KEY");
        const findPlaceRequest = await mapsClient.findPlaceFromText({
            params: {
                input: searchQuery,
                inputtype: google_maps_services_js_1.PlaceInputType.textQuery,
                fields: ["place_id", "name", "formatted_address"],
                key: MAPS_API_KEY
            },
        });
        if (findPlaceRequest.data.status !== "OK" || !findPlaceRequest.data.candidates?.[0]?.place_id) {
            console.warn(`Maps API - findPlaceFromText failed for query "${searchQuery}":`, findPlaceRequest.data.status);
            return res.status(404).json({ error: `Google Maps could not find a location matching "${searchQuery}".` });
        }
        const placeId = findPlaceRequest.data.candidates[0].place_id;
        const detailsResponse = await mapsClient.placeDetails({
            params: {
                place_id: placeId,
                fields: ["name", "rating", "reviews", "website", "url", "photos", "formatted_address", "geometry"],
                key: MAPS_API_KEY,
            },
        });
        if (detailsResponse.data.status !== "OK") {
            console.error("Maps API - placeDetails failed:", detailsResponse.data.status);
            return res.status(500).json({ error: `Google Maps API Error on placeDetails: ${detailsResponse.data.status}` });
        }
        const placeDetails = detailsResponse.data.result;
        const photoUrls = (placeDetails.photos || []).map(p => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}&key=${MAPS_API_KEY}`);
        res.json({ ...placeDetails, photoUrls });
    }
    catch (error) {
        console.error(`FATAL ERROR in /maps/place-details:`, error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});
// Gemini API Endpoint
const generateAIContent = async (prompt, action) => {
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(getApiKey("GEMINI_KEY"));
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch (error) {
        console.error(`Gemini API Error for action "${action}":`, error);
        if (error.message && error.message.includes("PERMISSION_DENIED")) {
            throw new Error("AI API Call Failed: The 'Vertex AI API' is not enabled for this Google Cloud project. Please go to the Google Cloud Console and enable it.");
        }
        throw new Error(`AI content generation failed. Please check the server logs.`);
    }
};
app.post("/gemini", async (req, res) => {
    const { action, payload } = req.body;
    if (!action || !payload)
        return res.status(400).json({ error: "Missing 'action' or 'payload'." });
    let prompt = "";
    const { locationName } = payload;
    try {
        switch (action) {
            case "getReviewSummary":
                const { reviews } = payload;
                const reviewTexts = (reviews || []).map((r) => r.text).filter((text) => text?.trim()).join("\n---\n");
                if (!reviewTexts)
                    return res.json({ content: "There are no written reviews available to analyze for this location." });
                prompt = `As a restaurant operations analyst, summarize customer reviews for "${locationName}". Use Google Search to find recent reviews from the web to supplement the provided review data. Identify key themes, recent positive feedback, and urgent areas for improvement. Use clear headings. Reviews:\n${reviewTexts}`;
                break;
            case "getLocationMarketAnalysis":
                prompt = `Analyze the local market for "${locationName}". Be detailed and actionable. Use Google Search to find the most current information on local events, holidays, news, and consumer trends. Include sections for: 1. Recent & Upcoming Local Events & Holidays. 2. Current Macro/Micro Trends. 3. Competitive Landscape. 4. Actionable Opportunities (3-5 specific, creative ideas).`;
                break;
            case "generateHuddleBrief":
                const { performanceData, audience, weather } = payload;
                const promotions = "Check tupelohoneycafe.com for latest company promotions.";
                const baseInfo = `- Location: ${locationName}\n- Weather: ${weather || "N/A"}\n- KPIs: ${performanceData || "N/A"}\n- Promotions: ${promotions}`;
                if (audience === "FOH") {
                    prompt = `Generate a fun, high-energy FOH pre-shift brief for "${locationName}". Goal: Motivate, drive sales, ensure amazing guest experience. ${baseInfo}. Today's Focus: 1. Sales Contest (e.g., 'Sell the most XYZ cocktail to win a prize!'). 2. Service Goal (e.g., 'Focus on 5-star reviews; mention review sites to happy guests'). 3. Shift Game (e.g., 'Secret Compliment game is on!').`;
                }
                else if (audience === "BOH") {
                    prompt = `Generate a focused, passionate BOH pre-shift brief for "${locationName}" inspired by Anthony Bourdain. Goal: Culinary excellence, safety, high standards. ${baseInfo}. Today's Focus: 1. Kitchen Safety ('Work clean, work safe. Sharp knives, hot pans. No shortcuts.'). 2. Health Standards ('If you wouldn't serve it to your family, don't serve it to a guest.'). 3. Passion & Pride ('Every plate has our signature. Make it count. Cook with passion.').`;
                }
                else { // Managers
                    prompt = `Generate a strategic, inspiring management pre-shift brief for "${locationName}". Goal: Align team, drive profit, foster positive culture. ${baseInfo}. Strategic Focus: 1. Floor Leadership ('Be present. Connect with 5 tables personally. Touch tables, support the team.'). 2. Cost Control ('Watch waste on the ABC dish. Ensure perfect prep.'). 3. Culture Initiative ('What gets celebrated gets repeated. Publicly praise 3 team members today.').`;
                }
                break;
            case "getSalesForecast":
                const { historicalData, weatherForecast } = payload;
                prompt = `As a data analyst, create a 7-day sales forecast for "${locationName}". Use Google Search to find any major upcoming local events, holidays, or news that could impact sales. Use this, along with the provided weather forecast and historical data, to create your forecast. Present as a simple, day-by-day list (e.g., "Monday: $XXXX (Sunny, 75°F) - Expected slight increase due to a local festival."). Data: Weather: ${JSON.stringify(weatherForecast)}, History: ${historicalData || "Use general restaurant sales patterns."}`;
                break;
            case "getMarketingIdeas":
                prompt = `Generate creative, actionable, local marketing ideas for the manager of "${locationName}". Use Google Search to find current local trends, events, or news to inspire your ideas. Provide ideas for different generations (Gen Z/Millennials, Gen X, Boomers) and budgets (Low/No, Moderate). Structure: For [Generation] ([Focus]): - *Low Budget:* [Idea]. - *Moderate Budget:* [Idea]. Example: For Gen Z (Digital): - Low: 'Host an Instagram contest for best photo in the restaurant.' - Moderate: 'Partner with a local micro-influencer.'`;
                break;
            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
        const content = await generateAIContent(prompt, action);
        res.json({ content });
    }
    catch (error) {
        console.error(`Error in /gemini for action ${action}:`, error);
        res.status(503).json({ error: getErrorMessage(error) });
    }
});
// --- Export the Express App ---
exports.api = (0, https_1.onRequest)({ secrets: ["GEMINI_KEY", "MAPS_KEY"] }, app);
//# sourceMappingURL=index.js.map