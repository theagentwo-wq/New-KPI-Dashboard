
// V6 - Add getDirectorPerformanceSnapshot case to resolve AI feature failure
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { VertexAI } from "@google-cloud/vertexai";
import { Client } from "@googlemaps/google-maps-services-js";

// Initialize Firebase and Express
admin.initializeApp();
const app = express();
const mapsClient = new Client({});

// --- Middleware ---
app.use(cors({ origin: true }));
app.use(express.json());

// --- Helper Functions ---
const getErrorMessage = (error: any): string => {
    if (error instanceof Error) return error.message;
    return "An unknown error occurred.";
};

// --- Google Places API Endpoint ---
app.post("/getPlaceDetails", async (req, res) => {
    const { location } = req.body;
    if (!location) {
        return res.status(400).json({ error: "Missing 'location' in payload." });
    }

    const apiKey = process.env.VITE_MAPS_KEY;
    if (!apiKey) {
        console.error("VITE_MAPS_KEY secret not configured for the function.");
        return res.status(500).json({ error: "Server configuration error: API key not found." });
    }

    try {
        // First, find the Place ID from the text query
        const findPlaceResponse = await mapsClient.findPlaceFromText({
            params: {
                input: location,
                inputtype: 'textquery',
                fields: ['place_id', 'name'],
                key: apiKey,
            },
        });

        if (findPlaceResponse.data.candidates.length === 0) {
            return res.status(404).json({ error: `Could not find a location matching "${location}".` });
        }
        
        const placeId = findPlaceResponse.data.candidates[0].place_id;
        if (!placeId) {
             return res.status(404).json({ error: `Could not get a Place ID for "${location}".` });
        }

        // Second, use the Place ID to get detailed information
        const placeDetailsResponse = await mapsClient.placeDetails({
            params: {
                place_id: placeId,
                fields: ['name', 'rating', 'reviews', 'website', 'url', 'photo', 'formatted_address', 'geometry'],
                key: apiKey,
            },
        });

        const details = placeDetailsResponse.data.result;
        
        // Third, construct full photo URLs, as the API only returns references
        const photoUrls = (details.photos || []).map(photo => {
            const photoReference = photo.photo_reference;
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
        });

        res.json({ ...details, photoUrls });

    } catch (error) {
        console.error(`Google Maps API Error for location '${location}':`, error);
        res.status(500).json({ error: `Failed to fetch place details. Reason: ${getErrorMessage(error)}` });
    }
});

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
                const reviewTexts = (reviews || []).map((r: any) => r.text).filter((text: string | null) => text?.trim()).join("\n---\n");
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
                    prompt = `Generate a fun, high-energy FOH pre-shift huddle brief for "${locationName}". Goal is to motivate, drive sales, and ensure an amazing guest experience. ${baseInfo}. Today\'s Focus: 1. Sales Contest (e.g., \'Sell the most XYZ to win!\'). 2. Service Goal (e.g., \'Focus on 5-star reviews; mention review sites\'). 3. Shift Game (e.g., \'Secret Compliment game is on!\').`;
                } else if (audience === "BOH") {
                    prompt = `Generate a focused, passionate BOH pre-shift brief for "${locationName}" inspired by Anthony Bourdain. Goal is to culinary excellence and safety. ${baseInfo}. Today\'s Focus: 1. Kitchen Safety (\'Work clean, work safe.\'). 2. Health Standards (\'If you wouldn\'t serve it to your family, don\'t serve it.\'). 3. Passion & Pride (\'Every plate has our signature. Make it count.\').`;
                } else { // Managers
                    prompt = `Generate a strategic management pre-shift brief for "${locationName}". Goal is to align the team, drive profit, and foster culture. ${baseInfo}. Strategic Focus: 1. Floor Leadership (\'Connect with 5 tables personally.\'). 2. Cost Control (\'Watch waste on the ABC dish.\'). 3. Culture Initiative (\'Publicly praise 3 team members today.\').`;
                }
                break;

            case "getSalesForecast":
                const { historicalData, weatherForecast } = payload;
                prompt = `As a data analyst, create a 7-day sales forecast for "${locationName}". Use Google Search to find major upcoming local events or holidays. Use this, plus the provided weather, to create the forecast. Present as a simple, day-by-day list (e.g., "Monday: $XXXX (Sunny) - Increase due to local festival."). Data: Weather: ${JSON.stringify(weatherForecast)}, History: ${historicalData || "Use general restaurant sales patterns."}`;
                break;

            case "getMarketingIdeas":
                prompt = `Generate creative, actionable, local marketing ideas for the manager of "${locationName}". Use Google Search for current local trends and events. Provide ideas for different generations (Gen Z/Millennials, Gen X, Boomers) and budgets (Low/No, Moderate). Structure: For [Generation] ([Focus]): - *Low Budget:* [Idea]. - *Moderate Budget:* [Idea].`;
                break;

            case "getDirectorPerformanceSnapshot":
                const { directorName, periodLabel, aggregateData } = payload;
                prompt = `As a senior business analyst, provide a concise performance snapshot for the director, \"${directorName}\", for the period of ${periodLabel}. The director's region has the following aggregated performance data: ${JSON.stringify(aggregateData)}. Your snapshot should be in markdown format. Start with a headline. Then, provide a 2-3 sentence executive summary. Follow with a bulleted list of 3-4 key insights, highlighting both strengths and areas for improvement. Use Google Search to provide context on regional performance if relevant. Conclude with a single, actionable recommendation.`;
                break;

            default:
                return res.status(501).json({ error: `The action '${action}' is not implemented on the server.` });
        }
        
        const content = await generateAIContent(prompt, action);
        res.json({ content });

    } catch (error) {
        console.error(`Error in /gemini for action '${action}':`, error);
        res.status(500).json({ error: `Failed to process AI request for action: ${action}. Reason: ${getErrorMessage(error)}` });
    }
});


const generateAIContent = async (prompt: string, action: string) => {
    try {
        const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });
        const model = 'gemini-1.5-pro-latest';
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: {
                'maxOutputTokens': 8192,
                'temperature': 1,
                'topP': 0.95,
            },
            tools: [{'googleSearchRetrieval': {},}],
        });

        const result = await generativeModel.generateContent(prompt);
        
        if (!result.response.candidates?.[0]?.content.parts[0]?.text) {
            console.error(`Vertex AI Error - Empty Response for action "${action}":`, JSON.stringify(result.response, null, 2));
            throw new Error('The AI model returned an empty or invalid response.');
        }

        const responseText = result.response.candidates[0].content.parts[0].text;
        return responseText;

    } catch (error: any) {
        console.error(`Vertex AI Error for action "${action}":`, error);
        if (error.message && error.message.includes("PERMISSION_DENIED")) {
             throw new Error("AI API Call Failed: The 'Vertex AI User' role is likely missing for the service account. Please check your project's IAM settings.");
        }
        throw new Error(`AI content generation failed for action: ${action}. Please check the server logs.`);
    }
};

export const api = onRequest({ secrets: ["VITE_MAPS_KEY"] }, app);
