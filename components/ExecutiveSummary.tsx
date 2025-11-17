import React, { useState, useEffect } from 'react';
import { getExecutiveSummary } from '../services/geminiService';
import { View, Period } from '../types';
import { Icon } from './Icon';

interface ExecutiveSummaryProps {
  data: any;
  view: View;
  period: Period;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data, view, period }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When the view or period changes, the old summary is no longer relevant.
  // Reset it so the user can generate a new one.
  useEffect(() => {
    setSummary('');
  }, [data, view, period]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary(''); // Clear previous summary before generating new one.
    if (data) {
      const result = await getExecutiveSummary(data, view, period.label);
      setSummary(result);
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2 min-h-[60px]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            <p className="text-slate-400">Generating AI summary...</p>
        </div>
      );
    }

    if (summary) {
      return <p className="text-slate-300">{summary}</p>;
    }

    return (
      <div className="text-center py-4">
        <p className="text-slate-400 mb-3 text-sm">Get an AI-powered summary of the key highlights for this period.</p>
        <button 
          onClick={handleGenerateSummary} 
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"
        >
          <Icon name="sparkles" className="w-5 h-5" />
          Generate Summary
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
       <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Executive Summary</h2>
          {summary && !isLoading && (
              <button onClick={handleGenerateSummary} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                  <Icon name="sparkles" className="w-4 h-4" />
                  Regenerate
              </button>
          )}
      </div>
      {renderContent()}
    </div>
  );
};