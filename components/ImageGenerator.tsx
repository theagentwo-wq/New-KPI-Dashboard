import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icon } from './Icon';

export const ImageGenerator: React.FC = () => {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setIsKeySelected(true);
        }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success and update UI immediately to avoid race conditions
        setIsKeySelected(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setImageUrl(null);
    setError(null);
    try {
      const apiKey = process.env.VITE_API_KEY;
      if (!apiKey) {
          throw new Error("API key not found after selection. Please select an API key to use this feature.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
          },
      });
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      setImageUrl(`data:image/jpeg;base64,${base64ImageBytes}`);
    } catch (e: any) {
      console.error("Error generating image:", e);
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);

      if (errorMessage.includes("Requested entity was not found.")) {
        setIsKeySelected(false);
        setError("There was an issue with the selected API key. Please select a key and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isKeySelected) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Icon name="goal" className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
            <h4 className="text-lg font-bold text-slate-200">API Key Required</h4>
            <p className="text-slate-400 mt-2 max-w-sm">
                Image generation with Imagen requires you to select your own Google AI API key.
                Your key is securely handled and not stored by this application.
            </p>
            <p className="text-xs text-slate-500 mt-2">
                For information on billing, please see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">official documentation</a>.
            </p>
            <button onClick={handleSelectKey} className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
                Select API Key
            </button>
             {error && (
                <div className="mt-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-md">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
             <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <span>Generating image...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-md">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={prompt} className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
           <div className="text-center text-slate-500">
                <Icon name="reviews" className="w-12 h-12 mx-auto mb-2" />
                <p>Enter a prompt below to generate an image.</p>
           </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., A robot holding a red skateboard"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
            disabled={isLoading}
          />
          <button onClick={handleGenerate} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};