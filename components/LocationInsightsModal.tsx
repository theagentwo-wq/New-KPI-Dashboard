import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast } from '../services/geminiService';
import { get7DayForecastForLocation } from '../services/weatherService';
import { marked } from 'marked';
import { PerformanceData, ForecastDataPoint, DailyForecast, WeatherCondition } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeatherIcon } from './WeatherIcon';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  performanceData?: PerformanceData;
}

type AnalysisType = 'brief' | 'forecast' | 'none';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-slate-900 border border-slate-700 rounded-md shadow-lg">
        <p className="label font-bold text-slate-200">{`${label}`}</p>
        <p className="intro text-cyan-400">{`Predicted Sales: $${data.predictedSales.toLocaleString()}`}</p>
        {data.weatherDescription && <p className="text-slate-400">{data.weatherDescription}</p>}
      </div>
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload, weatherData }: any) => {
    const dataPoint = weatherData.find((d: ForecastDataPoint) => d.date === payload.value);
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize="12">
                {payload.value}
            </text>
            {dataPoint?.weatherIcon && (
                 <foreignObject x={-12} y={-24} width={24} height={24}>
                    <WeatherIcon condition={dataPoint.weatherIcon as WeatherCondition} className="w-6 h-6" />
                </foreignObject>
            )}
        </g>
    );
};


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
    if (!location) return;
    setIsLoading(true);
    setBriefResult(null);
    setForecastResult([]);
    setCurrentAnalysis(type);

    if (type === 'brief' && performanceData) {
      const res = await generateHuddleBrief(location, performanceData);
      setBriefResult(res);
    } else if (type === 'forecast') {
      const weatherForecast = await get7DayForecastForLocation(location);
      if(weatherForecast) {
        const res = await getSalesForecast(location, weatherForecast);
        setForecastResult(res);
      } else {
        // Handle case where weather could not be fetched
        setForecastResult([]); // Or show an error
      }
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center space-x-2 min-h-[250px]">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                <p className="text-slate-400">
                    {currentAnalysis === 'brief' ? 'Generating HOT TOPICS...' : 'Generating Weather-Aware Sales Forecast...'}
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
                 <h4 className="text-lg font-bold text-cyan-400 mb-4">7-Day Weather-Aware Sales Forecast</h4>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastResult} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={<CustomXAxisTick weatherData={forecastResult} />} height={50} />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ bottom: -5 }} />
                        <Line type="monotone" dataKey="predictedSales" stroke="#22d3ee" strokeWidth={2} name="Predicted Sales" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }
     if (currentAnalysis === 'forecast' && !isLoading) {
        return <p className="text-slate-400 text-center py-8">Could not generate a sales forecast at this time.</p>
    }
    
    return <p className="text-slate-300 text-center py-8">Select an AI action to run for {location}.</p>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Store Actions for ${location}`}>
      <div className="space-y-4">
        <div className="flex gap-4 p-2 bg-slate-900 rounded-md">
          <button onClick={() => handleAnalysis('brief')} disabled={isLoading || !performanceData} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">
            Generate HOT TOPICS
          </button>
           <button onClick={() => handleAnalysis('forecast')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate 7-Day Forecast
          </button>
        </div>

        <div className="mt-4 p-4 bg-slate-800 rounded-md border border-slate-700 min-h-[250px]">
            {renderContent()}
        </div>
      </div>
    </Modal>
  );
};