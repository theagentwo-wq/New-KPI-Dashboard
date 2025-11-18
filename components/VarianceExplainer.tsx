import React, { useState, useCallback } from 'react';
import { Kpi, PerformanceData } from '../types';
import { getVarianceAnalysis } from '../services/geminiService';
import { Icon } from './Icon';

interface VarianceExplainerProps {
  storeId: string;
  kpi: Kpi;
  variance: number;
  allKpis: PerformanceData;
}

export const VarianceExplainer: React.FC<VarianceExplainerProps> = ({ storeId, kpi, variance, allKpis }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Determine if the variance is significant enough to show the button
  const isSignificant = Math.abs(variance) > (kpi === Kpi.Sales ? 0.05 : 0.02);

  const fetchAnalysis = useCallback(async () => {
    if (isLoading || analysis) {
      setIsOpen(true);
      return;
    }
    
    setIsLoading(true);
    setIsOpen(true);
    const result = await getVarianceAnalysis(storeId, kpi, variance, allKpis);
    setAnalysis(result);
    setIsLoading(false);
  }, [isLoading, analysis, storeId, kpi, variance, allKpis]);

  if (!isSignificant) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center ml-1">
      <button 
        onClick={fetchAnalysis}
        onBlur={() => setIsOpen(false)}
        className="text-cyan-400 opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label={`Get analysis for ${kpi} variance`}
      >
        <Icon name="sparkles" className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 z-30 shadow-lg" role="tooltip">
          {isLoading ? (
             <div className="flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.1s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            </div>
          ) : (
            analysis
          )}
        </div>
      )}
    </div>
  );
};