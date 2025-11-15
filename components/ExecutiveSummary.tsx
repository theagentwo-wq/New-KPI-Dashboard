
import React, { useState, useEffect } from 'react';
import { getExecutiveSummary } from '../services/geminiService';
import { View, Period } from '../types';

interface ExecutiveSummaryProps {
  data: any;
  view: View;
  period: Period;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data, view, period }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      if (data) {
        const result = await getExecutiveSummary(data, view, period.label);
        setSummary(result);
      }
      setIsLoading(false);
    };

    fetchSummary();
  }, [data, view, period]);

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold text-cyan-400 mb-2">Executive Summary</h2>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            <p className="text-slate-400">Generating AI summary...</p>
        </div>
      ) : (
        <p className="text-slate-300">{summary}</p>
      )}
    </div>
  );
};