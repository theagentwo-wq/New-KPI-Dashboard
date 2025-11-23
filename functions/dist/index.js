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
// Access secrets as environment variables.
const geminiApiKey = process.env.GEMINI_KEY;
const mapsApiKey = process.env.MAPS_KEY;
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
const geminiRouter = express_1.default.Router();
const mapsRouter = express_1.default.Router();
geminiRouter.post("/", async (req, res) => {
    if (!geminiApiKey) {
        console.error("FATAL: GEMINI_KEY secret not set.");
        return res.status(500).json({ error: "Server configuration error: AI service is not available." });
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
    const { action, payload } = req.body;
    if (!action)
        return res.status(400).json({ error: "No action specified" });
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    let prompt = "";
    try {
        switch (action) {
            case "getExecutiveSummary":
                const { data, view, periodLabel } = payload;
                prompt = `Generate an executive summary for the ${view} view for the period ${periodLabel}. Data: ${JSON.stringify(data)}`;
                break;
            case "getReviewSummary":
                const { locationName, reviews } = payload;
                if (!reviews || !locationName)
                    return res.status(400).json({ error: "Location name and reviews are required." });
                prompt = `Generate a concise summary of customer reviews for the restaurant \'${locationName}\'. Highlight recurring positive themes (e.g., specific dishes, service quality, atmosphere) and negative feedback. Start with a 1-2 sentence overall sentiment analysis. Reviews: ${JSON.stringify(reviews)}`;
                break;
            case "getLocationMarketAnalysis":
                const { location } = payload;
                if (!location)
                    return res.status(400).json({ error: "Location is required for market analysis." });
                prompt = `Generate a concise local market analysis for a restaurant in ${location}. Focus on: 1. Key demographic and economic trends. 2. The competitive landscape (types of restaurants, price points). 3. Potential opportunities for growth or differentiation.`;
                break;
            case "getMarketingIdeas":
                const { location: marketingLocation } = payload;
                if (!marketingLocation)
                    return res.status(400).json({ error: "Location is required for marketing ideas." });
                prompt = `Generate 3-5 innovative, actionable marketing ideas for a restaurant in \'${marketingLocation}\'. The ideas should be tailored to the local market and include a mix of digital and community-based strategies.`;
                break;
            case "generateHuddleBrief":
                const { location: huddleLocation, storeData, audience, weather } = payload;
                prompt = `Generate a pre-shift huddle brief for the \'${audience}\' team at the \'${huddleLocation}\' restaurant. Today\'s weather: ${weather ? JSON.stringify(weather) : 'not available'}. Key store data for the day: ${JSON.stringify(storeData)}. The brief should be upbeat, concise, and highlight 1-2 key focus areas for the upcoming shift.`;
                break;
            default:
                return res.status(501).json({ error: `The action \'${action}\' is not implemented on the server.` });
        }
        try {
            const generationResult = await model.generateContent(prompt);
            const content = generationResult.response.text();
            res.json({ content });
        }
        catch (error) {
            console.error(`Gemini API Error for action \'${action}\':`, error);
            res.status(500).json({ error: `Failed to generate AI content for action ${action}.` });
        }
    }
    catch (error) {
        console.error(`Error in /gemini router for action \'${action}\':`, error);
        res.status(500).json({ error: `Failed to process AI request for action ${action}.` });
    }
});
mapsRouter.get("/apiKey", (req, res) => {
    try {
        if (!mapsApiKey) {
            console.error("FATAL: MAPS_KEY secret not found in environment.");
            return res.status(500).json({ error: "Server configuration error: Mapping service API key is not available." });
        }
        res.json({ apiKey: mapsApiKey });
    }
    catch (error) {
        console.error("Error in /maps/apiKey:", error);
        res.status(500).json({ error: "Could not retrieve Maps API key due to an internal error." });
    }
});
mapsRouter.post("/placeDetails", async (req, res) => {
    if (!mapsApiKey) {
        console.error("FATAL: MAPS_KEY secret not set.");
        return res.status(500).json({ error: "Server configuration error: Mapping service is not available." });
    }
    const mapsClient = new google_maps_services_js_1.Client({});
    const { location } = req.body;
    if (!location)
        return res.status(400).json({ error: "Location is required." });
    const searchQuery = `Tupelo Honey Cafe ${location}`;
    try {
        const findPlaceResponse = await mapsClient.findPlaceFromText({
            params: {
                input: searchQuery,
                inputtype: google_maps_services_js_1.PlaceInputType.textQuery,
                fields: ['place_id'],
                key: mapsApiKey,
            }
        });
        if (findPlaceResponse.data.status !== 'OK' || !findPlaceResponse.data.candidates || findPlaceResponse.data.candidates.length === 0) {
            console.error("Maps API Error (findPlaceFromText):", findPlaceResponse.data.error_message);
            return res.status(404).json({ error: findPlaceResponse.data.error_message || `Could not find a location for search: \'${searchQuery}\'` });
        }
        const placeId = findPlaceResponse.data.candidates[0].place_id;
        if (!placeId)
            return res.status(404).json({ error: 'Could not extract Place ID from search.' });
        const detailsResponse = await mapsClient.placeDetails({
            params: {
                place_id: placeId,
                fields: ["name", "rating", "photos", "url", "website", "reviews", "geometry"],
                key: mapsApiKey,
            },
        });
        if (detailsResponse.data.status === 'OK') {
            res.json({ data: detailsResponse.data.result });
        }
        else {
            console.error("Maps API Error (placeDetails):", detailsResponse.data.error_message);
            res.status(500).json({ error: detailsResponse.data.error_message || `Google Maps API Error: ${detailsResponse.data.status}` });
        }
    }
    catch (error) {
        console.error(`Error processing place details for search: ${searchQuery}`, error);
        res.status(500).json({ error: "Failed to process place details request." });
    }
});
app.use("/gemini", geminiRouter);
app.use("/maps", mapsRouter);
// Export the Express app as a V2 HTTPS function.
// This requires the GEMINI_KEY and MAPS_KEY secrets to be available.
exports.api = (0, https_1.onRequest)({ secrets: ["GEMINI_KEY", "MAPS_KEY"], cpu: "gcf_gen1" }, app);
//# sourceMappingURL=index.js.map