import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast, getLocationMarketAnalysis, getMarketingIdeas } from '../services/geminiService';
import { get7DayForecastForLocation } from '../services/weatherService';
import { marked } from 'marked';
import { PerformanceData, ForecastDataPoint, WeatherCondition } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeatherIcon } from './WeatherIcon';
import { Icon } from './Icon';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  performanceData?: PerformanceData;
  userLocation?: { latitude: number; longitude: number } | null;
}

type AnalysisType = 'brief' | 'forecast' | 'market' | 'marketing' | 'none';

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


export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location, performanceData, userLocation }) => {
  const [briefResult, setBriefResult] = useState<string | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastDataPoint[]>([]);
  const [marketResult, setMarketResult] = useState<string | null>(null);
  const [marketingResult, setMarketingResult] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisType>('none');
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const renderMarkdown = async () => {
        const contentToRender = briefResult || marketResult || marketingResult;
        if (contentToRender) {
            const html = await marked.parse(contentToRender);
            setSanitizedHtml(html);
        } else {
            setSanitizedHtml('');
        }
    };
    renderMarkdown();
  }, [briefResult, marketResult, marketingResult]);

  useEffect(() => {
    if(!isOpen) {
        // Reset state on close
        setCurrentAnalysis('none');
        setBriefResult(null);
        setForecastResult([]);
        setMarketResult(null);
        setMarketingResult(null);
        setIsFullScreen(false); // Reset fullscreen state
    }
  }, [isOpen]);

  const handleAnalysis = async (type: AnalysisType) => {
    if (!location) return;
    setIsLoading(true);
    setBriefResult(null);
    setForecastResult([]);
    setMarketResult(null);
    setMarketingResult(null);
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
        setForecastResult([]); 
      }
    } else if (type === 'market') {
        const res = await getLocationMarketAnalysis(location);
        setMarketResult(res);
    } else if (type === 'marketing') {
        const res = await getMarketingIdeas(location, userLocation);
        setMarketingResult(res);
    }
    setIsLoading(false);
  };
  
  const loadingMessages: { [key in AnalysisType]: string } = {
    brief: 'Generating HOT TOPICS...',
    forecast: 'Generating Weather-Aware Sales Forecast...',
    market: 'Analyzing local market conditions...',
    marketing: 'Generating hyper-local marketing ideas...',
    none: ''
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center space-x-2 h-full">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                <p className="text-slate-400">{loadingMessages[currentAnalysis]}</p>
            </div>
        );
    }
    
    if ((currentAnalysis === 'brief' || currentAnalysis === 'market' || currentAnalysis === 'marketing') && sanitizedHtml) {
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
     if ((currentAnalysis === 'forecast' || currentAnalysis === 'market' || currentAnalysis === 'marketing') && !isLoading) {
        return <p className="text-slate-400 text-center py-8">Could not generate results at this time.</p>
    }
    
    return <p className="text-slate-300 text-center py-8">Select an AI action to run for {location}.</p>;
  }

  const headerControls = (
    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white">
        <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
    </button>
  );

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Store Actions for ${location}`} 
        size={isFullScreen ? 'fullscreen' : 'large'}
        headerControls={headerControls}
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-slate-900 rounded-md">
          <button onClick={() => handleAnalysis('brief')} disabled={isLoading || !performanceData} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">
            Generate HOT TOPICS
          </button>
           <button onClick={() => handleAnalysis('forecast')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate 7-Day Forecast
          </button>
           <button onClick={() => handleAnalysis('market')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Local Market Analysis
          </button>
           <button onClick={() => handleAnalysis('marketing')} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Generate Marketing Ideas
          </button>
        </div>

        <div className="mt-4 p-4 bg-slate-800 rounded-md border border-slate-700 flex-1 overflow-y-auto min-h-[250px] custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </Modal>
  );
};
