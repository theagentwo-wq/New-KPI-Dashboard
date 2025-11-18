import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    // This is a critical server configuration error.
    // The function will fail to load if the key is not set, preventing runtime errors
    // and guaranteeing to the compiler that `ai` is always valid if the function runs.
    throw new Error('FATAL: AI Service Error: GEMINI_API_KEY is not configured on the server.');
}

/**
 * A pre-initialized, type-safe instance of the GoogleGenAI client.
 * All backend functions should import and use this instance.
 */
export const ai = new GoogleGenAI({ apiKey: geminiApiKey });
