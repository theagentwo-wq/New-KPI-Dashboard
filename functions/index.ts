import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { Client as MapsClient, PlaceDetailsResponse } from '@googlemaps/google-maps-services-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Use a shared Maps client
const mapsClient = new MapsClient({});

// Define a function to get the API key from Firebase environment
const getApiKey = (keyName: string): string => {
  try {
    return functions.config().keys[keyName];
  } catch (error) {
    console.error(`Error accessing API key '${keyName}'. Ensure it is set in Firebase environment configuration.`, error);
    throw new functions.https.HttpsError('internal', `Could not retrieve API key: ${keyName}.`);
  }
};

app.post('/gemini', async (req: express.Request, res: express.Response) => {
  const { action, payload } = req.body;
  const genAI = new GoogleGenerativeAI(getApiKey('gemini'));

  try {
    let result;
    // Implement the various actions your frontend expects...
    // For example, a 'getExecutiveSummary' action
    if (action === 'getExecutiveSummary') {
        const { data, view, periodLabel } = payload;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Generate an executive summary for ${view} view for the period ${periodLabel}. Data: ${JSON.stringify(data)}`;
        const generationResult = await model.generateContent(prompt);
        result = { content: generationResult.response.text() };
    } else {
        throw new Error(`Unknown action: ${action}`);
    }
    res.json(result);
  } catch (error) {
    console.error(`Error in /gemini for action ${action}:`, error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

app.get('/maps/apiKey', (req: express.Request, res: express.Response) => {
  try {
    res.json({ apiKey: getApiKey('maps') });
  } catch (error) {
    console.error("Error getting Maps API key:", error);
    res.status(500).json({ error: "Could not retrieve Maps API key." });
  }
});

app.post('/maps/placeDetails', async (req: express.Request, res: express.Response) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  try {
    const response: PlaceDetailsResponse = await mapsClient.placeDetails({
      params: {
        place_id: address, // Assuming address is a place_id for simplicity
        fields: ['name', 'rating', 'photos'],
        key: getApiKey('maps')
      }
    });
    res.json({ data: response.data.result });
  } catch (error) {
    console.error(`Error fetching place details for address: ${address}`, error);
    res.status(500).json({ error: 'Failed to fetch place details.' });
  }
});

exports.api = functions.https.onRequest(app);
