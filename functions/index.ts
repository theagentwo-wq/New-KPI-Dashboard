
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { Client as MapsClient, FindPlaceFromTextResponse, PlaceInputType } from "@googlemaps/google-maps-services-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase and Express
admin.initializeApp();
const app = express();

// --- Middleware ---
app.use(cors({ origin: true }));
app.use(express.json());

// --- Helper Functions ---
const getApiKey = (keyName: "GEMINI_KEY" | "MAPS_KEY"): string => {
    const key = process.env[keyName];
    if (!key) throw new Error(`Server configuration error: ${keyName} is not set.`);
    return key;
};

const getErrorMessage = (error: any): string => {
    if (error instanceof Error) return error.message;
    return "An unknown error occurred.";
};

// --- Route Handlers ---

// Your firebase.json rewrite rule directs all requests starting with "/api" to this function.
// The "/api" prefix is stripped by the rewrite rule before it hits the Express server.
// Therefore, a request to "/api/maps/place-details" arrives here as "/maps/place-details".

// Maps API Endpoint
const mapsClient = new MapsClient({});
app.post("/maps/place-details", async (req, res) => {
    const { searchQuery } = req.body;
    if (!searchQuery) {
        return res.status(400).json({ error: "Missing 'searchQuery' in request body." });
    }

    try {
        const MAPS_API_KEY = getApiKey("MAPS_KEY");
        const findPlaceRequest: FindPlaceFromTextResponse = await mapsClient.findPlaceFromText({
            params: { input: searchQuery, inputtype: PlaceInputType.textQuery, fields: ["place_id", "name", "geometry"], key: MAPS_API_KEY },
        });

        if (findPlaceRequest.data.status !== "OK" || !findPlaceRequest.data.candidates?.[0]?.place_id) {
            return res.status(404).json({ error: `Could not find location matching "${searchQuery}".` });
        }

        const placeId = findPlaceRequest.data.candidates[0].place_id;
        const detailsResponse = await mapsClient.placeDetails({
            params: { place_id: placeId, fields: ["name", "rating", "reviews", "website", "url", "photos", "formatted_address"], key: MAPS_API_KEY },
        });

        if (detailsResponse.data.status !== "OK") {
            return res.status(500).json({ error: `Google Maps API Error: ${detailsResponse.data.status}` });
        }

        const placeDetails = detailsResponse.data.result;
        const photoUrls = (placeDetails.photos || []).map(p => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${MAPS_API_KEY}`);
        
        res.json({ ...placeDetails, geometry: findPlaceRequest.data.candidates[0].geometry, photoUrls });

    } catch (error) {
        console.error(`Error in /maps/place-details:`, error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

// Gemini API Endpoint
const generateAIContent = async (prompt: string, action: string) => {
    try {
        const genAI = new GoogleGenerativeAI(getApiKey("GEMINI_KEY"));
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error(`Gemini API Error for action "${action}":`, error);
        throw new Error(`AI content generation failed for action ${action}.`);
    }
};

app.post("/gemini", async (req, res) => {
    const { action, payload } = req.body;
    if (!action || !payload) return res.status(400).json({ error: "Missing 'action' or 'payload'." });

    let prompt = "";
    const { locationName } = payload;

    try {
        switch (action) {
             case "getReviewSummary":
                const { reviews } = payload;
                const reviewTexts = (reviews || []).map((r: any) => r.text).filter((text: string | null) => text?.trim()).join("\n---\n");
                if (!reviewTexts) return res.json({ content: "There are no written reviews available to analyze." });
                prompt = `As a restaurant operations analyst, summarize customer reviews for "${locationName}". Identify key themes, recent positive feedback, and urgent areas for improvement. Use clear headings. Reviews:\n${reviewTexts}`;
                break;

            case "getLocationMarketAnalysis":
                prompt = `Analyze the local market for "${locationName}". Be detailed and actionable. Include sections for: 1. Local Events & Holidays (check city calendars, news/entertainment guides). 2. Macro/Micro Trends (consumer behavior, local developments). 3. Competitive Landscape. 4. Actionable Opportunities (3-5 specific, creative ideas like event tie-ins or specials).`;
                break;

            case "generateHuddleBrief":
                const { performanceData, audience, weather } = payload;
                const promotions = "Check tupelohoneycafe.com for latest company promotions.";
                const baseInfo = `- Location: ${locationName}\n- Weather: ${weather || "N/A"}\n- KPIs: ${performanceData || "N/A"}\n- Promotions: ${promotions}`;

                if (audience === "FOH") {
                    prompt = `Generate a fun, high-energy FOH pre-shift brief for "${locationName}". Goal: Motivate, drive sales, ensure amazing guest experience. ${baseInfo}. Today's Focus: 1. Sales Contest (e.g., 'Sell the most XYZ cocktail to win a prize!'). 2. Service Goal (e.g., 'Focus on 5-star reviews; mention review sites to happy guests'). 3. Shift Game (e.g., 'Secret Compliment game is on!').`;
                } else if (audience === "BOH") {
                    prompt = `Generate a focused, passionate BOH pre-shift brief for "${locationName}" inspired by Anthony Bourdain. Goal: Culinary excellence, safety, high standards. ${baseInfo}. Today's Focus: 1. Kitchen Safety ('Work clean, work safe. Sharp knives, hot pans. No shortcuts.'). 2. Health Standards ('If you wouldn't serve it to your family, don't serve it to a guest.'). 3. Passion & Pride ('Every plate has our signature. Make it count. Cook with passion.').`;
                } else { // Managers
                    prompt = `Generate a strategic, inspiring management pre-shift brief for "${locationName}". Goal: Align team, drive profit, foster positive culture. ${baseInfo}. Strategic Focus: 1. Floor Leadership ('Be present. Connect with 5 tables personally. Touch tables, support the team.'). 2. Cost Control ('Watch waste on the ABC dish. Ensure perfect prep.'). 3. Culture Initiative ('What gets celebrated gets repeated. Publicly praise 3 team members today.').`;
                }
                break;

            case "getSalesForecast":
                const { historicalData, weatherForecast } = payload;
                prompt = `As a data analyst, create a 7-day sales forecast for "${locationName}". Use the provided 7-day weather forecast, consider historical sales data, local market conditions, and any major upcoming holidays/events. Present as a simple, day-by-day list (e.g., "Monday: $XXXX (Sunny, 75°F) - Expected slight increase due to weather."). Data: Weather: ${JSON.stringify(weatherForecast)}, History: ${historicalData || "Use general restaurant sales patterns."}`;
                break;

            case "getMarketingIdeas":
                prompt = `Generate creative, actionable, local marketing ideas for the manager of "${locationName}". Ideas must be easy to initiate locally. Provide ideas for different generations (Gen Z/Millennials, Gen X, Boomers) and budgets (Low/No, Moderate). Structure: For [Generation] ([Focus]): - *Low Budget:* [Idea]. - *Moderate Budget:* [Idea]. Example: For Gen Z (Digital): - Low: 'Host an Instagram contest for best photo in the restaurant.' - Moderate: 'Partner with a local micro-influencer.'`;
                break;
            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
        
        const content = await generateAIContent(prompt, action);
        res.json({ content });

    } catch (error) {
        console.error(`Error in /gemini:`, error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});


// --- Export the Express App ---
// This single 'api' export is picked up by Firebase.
export const api = onRequest({ secrets: ["GEMINI_KEY", "MAPS_KEY"] }, app);
