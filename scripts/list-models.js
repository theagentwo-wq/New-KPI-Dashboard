import { config as loadEnv } from 'dotenv';
loadEnv();
import { GoogleGenAI } from "@google/genai";

(async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('No Gemini API key found in environment. Please set GEMINI_API_KEY and re-run.');
      process.exit(2);
    }

    const ai = new GoogleGenAI({ apiKey });
    console.log('Requesting list of models...');
    const res = await ai.models.list();
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error listing models:', err);
    process.exit(1);
  }
})();
