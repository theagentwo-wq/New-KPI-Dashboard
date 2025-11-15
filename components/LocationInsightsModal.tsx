import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { getWeatherImpact, getLocalEvents } from '../services/geminiService';
import { marked } from 'marked';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
}

export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location }) => {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
        if (result) {
            const html = await marked.parse(result);
            setSanitizedHtml(html);
        } else {
            setSanitizedHtml('');
        }
    };
    renderMarkdown();
  }, [result]);

  const handleAnalysis = async (type: 'weather' | 'events') => {
    if (!location) return;
    setIsLoading(true);
    setResult(null);
    setCurrentAnalysis(type === 'weather' ? 'Analyzing Weather Impact...' : 'Checking Local Events...');

    let res = '';
    if (type === 'weather') {
      res = await getWeatherImpact(location);
    } else {
      res = await getLocalEvents(location);
    }
    setResult(res);
    setIsLoading(false);
  };
  
  const handleClose = () => {
    setResult(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`AI Insights for ${location}`}>
      <div className="space-y-4">
        <p className="text-slate-300">Select an AI-powered analysis to run for {location}.</p>
        <div className="flex gap-4">
          <button onClick={() => handleAnalysis('weather')} disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Analyze Weather Impact
          </button>
           <button onClick={() => handleAnalysis('events')} disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Check Local Events
          </button>
        </div>

        {(isLoading || result) && (
          <div className="mt-4 p-4 bg-slate-900 rounded-md border border-slate-700 min-h-[100px]">
            {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                    <p className="text-slate-400">{currentAnalysis}</p>
                </div>
            ) : (
                <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};