import { GoogleGenAI } from "@google/genai";

// This module implements the "Lazy Singleton" pattern.
// The AI client is not initialized when the module is loaded (at build-time).
// It is initialized on the first request at runtime, avoiding compiler errors.

let ai: GoogleGenAI | null = null;

export const getAIClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        // This is a critical runtime error if the key is not configured on the server.
        throw new Error('FATAL: AI Service Error: GEMINI_API_KEY is not configured on the server.');
    }

    ai = new GoogleGenAI({ apiKey: geminiApiKey });
    return ai;
};
