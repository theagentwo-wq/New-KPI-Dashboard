import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { Icon } from './Icon';

type Status = 'idle' | 'generating' | 'polling' | 'success' | 'error';

export const VideoGenerator: React.FC = () => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
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
        setStatus('generating');
        setVideoUrl(null);
        setError(null);

        try {
            const url = await generateVideo(prompt, aspectRatio, setStatusMessage);
            setVideoUrl(url);
            setStatus('success');
        } catch (e: any) {
            console.error("Error generating video:", e);
            const errorMessage = e.message || 'An unexpected error occurred.';
            setError(errorMessage);
            setStatus('error');

            if (errorMessage.includes("Requested entity was not found.")) {
                // This specific error suggests an issue with the API key, prompt user to select again
                setIsKeySelected(false);
                setError("There was an issue with the selected API key. Please select a key and try again.");
            }
        }
    };

    if (!isKeySelected) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Icon name="goal" className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                <h4 className="text-lg font-bold text-slate-200">API Key Required</h4>
                <p className="text-slate-400 mt-2 max-w-sm">
                    Video generation with Veo requires you to select your own Google AI API key.
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
                {status === 'generating' || status === 'polling' ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                        <span className="font-semibold">{statusMessage}</span>
                        <span className="text-sm">Please keep this tab open.</span>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-md">
                        <p className="font-bold">Error Generating Video</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-md" />
                ) : (
                    <div className="text-center text-slate-500">
                        <Icon name="dashboard" className="w-12 h-12 mx-auto mb-2" />
                        <p>Enter a prompt below to generate a video.</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-slate-700 space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={status === 'generating' || status === 'polling'}
                    />
                    <button onClick={handleGenerate} disabled={status === 'generating' || status === 'polling'} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
                        Generate
                    </button>
                </div>
                 <div className="flex items-center justify-center gap-4">
                    <label className="text-sm text-slate-300">Aspect Ratio:</label>
                    <div className="flex items-center bg-slate-900 rounded-md p-1">
                        <button onClick={() => setAspectRatio('16:9')} className={`px-3 py-1 text-sm font-semibold rounded ${aspectRatio === '16:9' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            16:9 Landscape
                        </button>
                         <button onClick={() => setAspectRatio('9:16')} className={`px-3 py-1 text-sm font-semibold rounded ${aspectRatio === '9:16' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            9:16 Portrait
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};