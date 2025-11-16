import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast } from '../services/geminiService';
import { marked } from 'marked';
import { PerformanceData, ForecastDataPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  performanceData?: PerformanceData;
}

type AnalysisType = 'brief' | 'forecast' | 'none';

export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location, performanceData }) => {
  const [briefResult, setBriefResult] = useState<string | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisType>('none');
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
        if (briefResult) {
            const html = await marked.parse(briefResult);
            setSanitizedHtml(html);
        } else {
            setSanitizedHtml('');
        }
    };
    renderMarkdown();
  }, [briefResult]);

  useEffect(() => {
    if(!isOpen) {
        // Reset state on close
        setCurrentAnalysis('none');
        setBriefResult(null);
        setForecastResult([]);
    }
  }, [isOpen]);

  const handleAnalysis = async (type: AnalysisType) => {
    if (!location || !performanceData) return;
    setIsLoading(true);
    setBriefResult(null);
    setForecastResult([]);
    setCurrentAnalysis(type);

    if (type === 'brief') {
      const res = await generateHuddleBrief(location, performanceData);
      setBriefResult(res);
    } else if (type === 'forecast') {
      // FIX: Removed second argument from getSalesForecast call as it only expects one argument.
      const res = await getSalesForecast(location); // Pass historical data if available
      setForecastResult(res);
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center space-x-2 min-h-[200px]">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                <p className="text-slate-400">
                    {currentAnalysis === 'brief' ? 'Generating HOT TOPICS...' : 'Generating Sales Forecast...'}
                </p>
            </div>
        );
    }
    
    if (currentAnalysis === 'brief' && briefResult) {
         return <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
    }

    if (currentAnalysis === 'forecast' && forecastResult.length > 0) {
        return (
            <div>
                 <h4 className="text-lg font-bold text-cyan-400 mb-2">7-Day Sales Forecast</h4>
                 <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={forecastResult} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        <Line type="monotone" dataKey="predictedSales" stroke="#22d3ee" strokeWidth={2} name="Predicted Sales" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }
    
    return <p className="text-slate-300 text-center py-8">Select an AI action to run for {location}.</p>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Store Actions for ${location}`}>
      <div className="space-y-4">
        <div className="flex gap-4 p-2 bg-slate-900 rounded-md">
          <button onClick={() => handleAnalysis('brief')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate HOT TOPICS
          </button>
           <button onClick={() => handleAnalysis('forecast')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate 7-Day Forecast
          </button>
        </div>

        <div className="mt-4 p-4 bg-slate-800 rounded-md border border-slate-700 min-h-[200px]">
            {renderContent()}
        </div>
      </div>
    </Modal>
  );
};
