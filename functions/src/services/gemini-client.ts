/**
 * Gemini AI Client Service
 * Uses AI Studio SDK with API key authentication
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private defaultModel: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-2.0-flash-lite - fast model with high quotas (4K RPM)
    // Best for AI Studio API keys
    this.defaultModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  /**
   * Get a model instance with custom configuration
   */
  private getModel(modelName?: string, temperature?: number) {
    if (!modelName) return this.defaultModel;

    return this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: temperature ?? 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  /**
   * Generate content from text prompt
   */
  async generateContent(prompt: string, modelName?: string, temperature?: number): Promise<string> {
    try {
      const model = this.getModel(modelName, temperature);
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Generate content with structured data
   */
  async generateFromData(prompt: string, data: any, modelName?: string, temperature?: number): Promise<string> {
    const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
    return this.generateContent(fullPrompt, modelName, temperature);
  }

  /**
   * Generate JSON response
   * For CSV import tasks, use: generateJSON(prompt, data, 'gemini-2.0-flash-exp', 0.2)
   */
  async generateJSON(prompt: string, data?: any, modelName?: string, temperature?: number): Promise<any> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just JSON.`;
    const fullPrompt = data
      ? `${jsonPrompt}\n\nData:\n${JSON.stringify(data, null, 2)}`
      : jsonPrompt;

    const response = await this.generateContent(fullPrompt, modelName, temperature);

    try {
      // Enhanced JSON extraction
      let cleaned = response.trim();

      // Remove markdown code blocks (all variations)
      cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

      // Find JSON object boundaries
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON response. First 500 chars:', response.substring(0, 500));
      console.error('Parse error:', error);
      throw new Error('Gemini returned invalid JSON');
    }
  }

  private getErrorMessage(error: any): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export const getGeminiClient = (apiKey: string): GeminiClient => {
  if (!geminiClient) {
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
};
