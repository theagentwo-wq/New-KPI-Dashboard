
import { https } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { Client as MapsClient, PlaceDetailsResponse } from "@googlemaps/google-maps-services-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const mapsClient = new MapsClient({});

// All routes are now prefixed with /api/ to match the hosting rewrite rule in firebase.json
const apiRouter = express.Router();

apiRouter.post("/gemini", async (req: express.Request, res: express.Response) => {
    const { action, payload } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    try {
        let result;
        // This is a simplified handler. In a real app, you'd have a switch or a more robust system.
        if (action === "getExecutiveSummary") {
            const { data, view, periodLabel } = payload;
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Generate an executive summary for ${view} view for the period ${periodLabel}. Data: ${JSON.stringify(data)}`;
            const generationResult = await model.generateContent(prompt);
            result = { content: generationResult.response.text() };
        } else {
             // Acknowledge other actions even if not fully implemented
            console.warn(`Action "${action}" received but not implemented.`);
            // Sending a specific error for the Huddle Brief for now.
            if (action === "generateHuddleBrief") {
                return res.status(501).json({ error: "Huddle Brief generation is not yet implemented on the server." });
            }
            // For other actions, return a generic "not implemented"
            result = { content: `Action '${action}' is not implemented.` };
        }
        res.json(result);
    } catch (error) {
        console.error(`Error in /gemini for action ${action}:`, error);
        res.status(500).json({ error: "Failed to process AI request" });
    }
});

apiRouter.get("/maps/apiKey", (req: express.Request, res: express.Response) => {
    try {
        res.json({ apiKey: process.env.MAPS_API_KEY });
    } catch (error) {
        console.error("Error getting Maps API key:", error);
        res.status(500).json({ error: "Could not retrieve Maps API key." });
    }
});

apiRouter.post("/maps/placeDetails", async (req: express.Request, res: express.Response) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }
    try {
        // In a real app, you should not pass the address as the place_id.
        // This is a simplification for this example.
        const response: PlaceDetailsResponse = await mapsClient.placeDetails({
            params: {
                place_id: address, 
                fields: ["name", "rating", "photos", "url", "website", "reviews"],
                key: process.env.MAPS_API_KEY!,
            },
        });
        res.json({ data: response.data.result });
    } catch (error) {
        console.error(`Error fetching place details for address: ${address}`, error);
        res.status(500).json({ error: "Failed to fetch place details." });
    }
});

// Mount the router under the /api base path
app.use('/api', apiRouter);

export const api = https.onRequest({ secrets: ["MAPS_API_KEY", "GEMINI_API_KEY"] }, app);
