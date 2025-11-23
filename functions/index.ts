// Trigger new deployment to apply secrets
import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { Client as MapsClient, PlaceDetailsResponse, FindPlaceFromTextResponse, PlaceInputType } from "@googlemaps/google-maps-services-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const geminiRouter = express.Router();
const mapsRouter = express.Router();

geminiRouter.post("/", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("FATAL: GEMINI_API_KEY environment variable not set.");
        return res.status(500).json({ error: "Server configuration error: AI service is not available." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { action, payload } = req.body;
    if (!action) return res.status(400).json({ error: "No action specified" });

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
                if (!reviews || !locationName) return res.status(400).json({ error: "Location name and reviews are required." });
                prompt = `Generate a concise summary of customer reviews for the restaurant \\"${locationName}\\". Highlight recurring positive themes (e.g., specific dishes, service quality, atmosphere) and negative feedback. Start with a 1-2 sentence overall sentiment analysis. Reviews: ${JSON.stringify(reviews)}`;
                break;
            case "getLocationMarketAnalysis":
                const { location } = payload;
                if (!location) return res.status(400).json({ error: "Location is required for market analysis." });
                prompt = `Generate a concise local market analysis for a restaurant in ${location}. Focus on: 1. Key demographic and economic trends. 2. The competitive landscape (types of restaurants, price points). 3. Potential opportunities for growth or differentiation.`;
                break;
            case "getMarketingIdeas":
                const { location: marketingLocation } = payload;
                 if (!marketingLocation) return res.status(400).json({ error: "Location is required for marketing ideas." });
                prompt = `Generate 3-5 innovative, actionable marketing ideas for a restaurant in \\"${marketingLocation}\\". The ideas should be tailored to the local market and include a mix of digital and community-based strategies.`;
                break;
            case "generateHuddleBrief":
                const { location: huddleLocation, storeData, audience, weather } = payload;
                prompt = `Generate a pre-shift huddle brief for the \\"${audience}\\" team at the \\"${huddleLocation}\\" restaurant. Today\'s weather: ${weather ? JSON.stringify(weather) : \'not available\'}. Key store data for the day: ${JSON.stringify(storeData)}. The brief should be upbeat, concise, and highlight 1-2 key focus areas for the upcoming shift.`;
                break;
            default:
                return res.status(501).json({ error: `The action \'${action}\' is not implemented on the server.` });
        }
        
        try {
            const generationResult = await model.generateContent(prompt);
            const content = generationResult.response.text();
            res.json({ content });
        } catch (error) {
            console.error(`Gemini API Error for action \\"${action}\\":`, error);
            res.status(500).json({ error: `Failed to generate AI content for action ${action}.` });
        }

    } catch (error) {
        console.error(`Error in /gemini router for action \\"${action}\\":`, error);
        res.status(500).json({ error: `Failed to process AI request for action ${action}.` });
    }
});

mapsRouter.get("/apiKey", (req, res) => {
    try {
        res.json({ apiKey: process.env.MAPS_API_KEY });
    } catch (error) {
        console.error("Error getting Maps API key:", error);
        res.status(500).json({ error: "Could not retrieve Maps API key." });
    }
});

mapsRouter.post("/placeDetails", async (req, res) => {
    if (!process.env.MAPS_API_KEY) {
        console.error("FATAL: MAPS_API_KEY environment variable not set.");
        return res.status(500).json({ error: "Server configuration error: Mapping service is not available." });
    }
    const mapsClient = new MapsClient({});
    const { location } = req.body;
    if (!location) return res.status(400).json({ error: "Location is required." });

    const searchQuery = \`Tupelo Honey Cafe ${location}\`;

    try {
        const findPlaceResponse: FindPlaceFromTextResponse = await mapsClient.findPlaceFromText({
            params: {
                input: searchQuery,
                inputtype: PlaceInputType.textQuery,
                fields: ['place_id'],
                key: process.env.MAPS_API_KEY,
            }
        });

        if (findPlaceResponse.data.status !== 'OK' || !findPlaceResponse.data.candidates || findPlaceResponse.data.candidates.length === 0) {
            console.error("Maps API Error (findPlaceFromText):", findPlaceResponse.data.error_message);
            return res.status(404).json({ error: findPlaceResponse.data.error_message || \`Could not find a location for search: \\"${searchQuery}\\\"\` });
        }

        const placeId = findPlaceResponse.data.candidates[0].place_id;
        if (!placeId) return res.status(404).json({ error: 'Could not extract Place ID from search.' });

        const detailsResponse: PlaceDetailsResponse = await mapsClient.placeDetails({
            params: {
                place_id: placeId,
                fields: ["name", "rating", "photos", "url", "website", "reviews", "geometry"],
                key: process.env.MAPS_API_KEY,
            },
        });

        if (detailsResponse.data.status === 'OK') {
            res.json({ data: detailsResponse.data.result });
        } else {
            console.error("Maps API Error (placeDetails):", detailsResponse.data.error_message);
            res.status(500).json({ error: detailsResponse.data.error_message || \`Google Maps API Error: ${detailsResponse.data.status}\` });
        }
    } catch (error) {
        console.error(\`Error processing place details for search: ${searchQuery}\`, error);
        res.status(500).json({ error: "Failed to process place details request." });
    }
});

app.use("/gemini", geminiRouter);
app.use("/maps", mapsRouter);

export const api = https.onRequest({ secrets: ["MAPS_API_KEY", "GEMINI_API_KEY"] }, app);
