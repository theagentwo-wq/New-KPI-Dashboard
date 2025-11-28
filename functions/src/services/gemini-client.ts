/**
 * Gemini AI Client Service
 * Wrapper for Google Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash-exp as specified in plan
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  /**
   * Generate content from text prompt
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
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
  async generateFromData(prompt: string, data: any): Promise<string> {
    const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
    return this.generateContent(fullPrompt);
  }

  /**
   * Generate JSON response
   */
  async generateJSON(prompt: string, data?: any): Promise<any> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just JSON.`;
    const fullPrompt = data
      ? `${jsonPrompt}\n\nData:\n${JSON.stringify(data, null, 2)}`
      : jsonPrompt;

    const response = await this.generateContent(fullPrompt);

    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
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
