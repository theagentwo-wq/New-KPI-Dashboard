import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast, getLocationMarketAnalysis, getMarketingIdeas, getStoreVisuals, getReviewSummary } from '../services/geminiService';
import { get7DayForecastForLocation, getWeatherForLocation } from '../services/weatherService';
import { marked } from 'marked';
import { PerformanceData, ForecastDataPoint, WeatherCondition, WeatherInfo, Kpi } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeatherIcon } from './WeatherIcon';
import { Icon } from './Icon';
import { DIRECTORS, KPI_CONFIG, KPI_ICON_MAP } from '../constants';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  performanceData?: PerformanceData;
  userLocation?: { latitude: number; longitude: number } | null;
}

type AnalysisTab = 'reviews' | 'market' | 'brief' | 'forecast' | 'marketing';
type Audience = 'FOH' | 'BOH' | 'Managers';

// --- Reusable Components for the Modal ---

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

const QuickStat: React.FC<{ kpi: Kpi; value?: number }> = ({ kpi, value }) => {
    if (value === undefined || isNaN(value)) return null;

    const config = KPI_CONFIG[kpi];
    const formattedValue = kpi.includes('Cost') || kpi.includes('SOP') || kpi.includes('Score')
        ? `${(value * 100).toFixed(1)}%`
        : value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={KPI_ICON_MAP[kpi]} className="w-4 h-4" />
                <span>{kpi}</span>
            </div>
            <span className="font-bold text-slate-200">{formattedValue}</span>
        </div>
    );
};

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
        </div>
        <p className="text-slate-400 mt-3">{message}</p>
    </div>
);

// --- Main Modal Component ---

export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location, performanceData, userLocation }) => {
    // State for UI and data
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeTab, setActiveTab] = useState<AnalysisTab>('reviews');
    
    // State for data fetching
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [storeImages, setStoreImages] = useState<string[]>([]);
    const [isImagesLoading, setIsImagesLoading] = useState(true);

    // State for each analysis tab (lazy-loaded)
    const [analysisContent, setAnalysisContent] = useState<{ [key in AnalysisTab]?: any }>({});
    const [isLoading, setIsLoading] = useState<{ [key in AnalysisTab]?: boolean }>({});
  
    const director = useMemo(() => {
        if (!location) return null;
        return DIRECTORS.find(d => d.stores.includes(location));
    }, [location]);

    // Reset all state when the modal is closed or the location changes
    useEffect(() => {
        if (!isOpen) {
            setIsFullScreen(false);
            setActiveTab('reviews');
        } else if (location) {
            // Reset all content when a new location is opened
            setAnalysisContent({});
            setIsLoading({});
            setStoreImages([]);
            setIsImagesLoading(true);
            setWeather(null);
            
            const fetchVisuals = async () => {
                setIsImagesLoading(true);
                const urls = await getStoreVisuals(location);
                setStoreImages(urls.length > 0 ? [...urls, ...urls] : []);
                setIsImagesLoading(false);
            };

            const fetchWeather = async () => {
                const weatherData = await getWeatherForLocation(location);
                setWeather(weatherData);
            };

            fetchVisuals();
            fetchWeather();
        }
    }, [isOpen, location]);

    // Lazy-load tab content when a tab is activated for the first time
    useEffect(() => {
        if (isOpen && location && !analysisContent[activeTab] && !isLoading[activeTab]) {
            handleAnalysis(activeTab);
        }
    }, [isOpen, location, activeTab, analysisContent, isLoading]);

    const handleAnalysis = async (type: AnalysisTab, audience?: Audience) => {
        if (!location) return;
        setIsLoading(prev => ({ ...prev, [type]: true }));

        let result: any = null;
        try {
            switch (type) {
                case 'reviews':
                    result = await getReviewSummary(location);
                    break;
                case 'market':
                    result = await getLocationMarketAnalysis(location);
                    break;
                case 'brief':
                    if (performanceData && audience) {
                        result = await generateHuddleBrief(location, performanceData, audience);
                    }
                    break;
                case 'forecast':
                    const weatherForecast = await get7DayForecastForLocation(location);
                    if (weatherForecast) {
                        result = await getSalesForecast(location, weatherForecast);
                    } else {
                        result = [];
                    }
                    break;
                case 'marketing':
                    result = await getMarketingIdeas(location, userLocation);
                    break;
            }

            if (typeof result === 'string') {
                result = await marked.parse(result);
            }
            
        } catch (error) {
            console.error(`Error fetching analysis for ${type}:`, error);
            result = `<p class="text-red-400">Could not generate results at this time.</p>`;
        }
        
        setAnalysisContent(prev => ({ ...prev, [type]: result }));
        setIsLoading(prev => ({ ...prev, [type]: false }));
    };
    
    const tabConfig: { id: AnalysisTab; label: string; icon: string }[] = [
        { id: 'reviews', label: 'Reviews & Buzz', icon: 'reviews' },
        { id: 'market', label: 'Local Market', icon: 'sop' },
        { id: 'brief', label: 'Huddle Brief', icon: 'news' },
        { id: 'forecast', label: 'Forecast', icon: 'sales' },
        { id: 'marketing', label: 'Marketing', icon: 'sparkles' },
    ];

    const renderTabContent = () => {
        const content = analysisContent[activeTab];
        
        if (isLoading[activeTab]) {
            return <LoadingSpinner message={`Generating ${activeTab} analysis...`} />;
        }
        if (!content) return null;

        if (activeTab === 'forecast') {
            return content.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={content} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={<CustomXAxisTick weatherData={content} />} height={50} />
                        <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ bottom: -5 }} />
                        <Line type="monotone" dataKey="predictedSales" stroke="#22d3ee" strokeWidth={2} name="Predicted Sales" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : <p className="text-center text-slate-400 py-8">Sales forecast data is currently unavailable.</p>;
        }

        return <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: content }} />;
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Store Hub: ${location}`} 
            size={isFullScreen ? 'fullscreen' : 'large'}
            headerControls={
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white">
                    <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                </button>
            }
        >
            <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Left Column: Visuals & Quick Info */}
                <div className="md:w-1/3 space-y-4 flex-shrink-0">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <h3 className="font-bold text-lg text-white">{location}</h3>
                        {director && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                                <img src={director.photo} alt={director.name} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                    <p className="text-slate-400">Area Director</p>
                                    <p className="font-semibold text-cyan-400">{director.name} {director.lastName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between">
                         <div className="text-sm">
                            <p className="text-slate-400">Current Weather</p>
                            <p className="font-semibold text-white">{weather?.shortForecast || 'Loading...'}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{weather?.temperature}°F</span>
                            <WeatherIcon condition={weather?.condition || 'loading'} className="w-10 h-10"/>
                         </div>
                    </div>
                    
                    <div className="h-40 w-full overflow-hidden bg-slate-900 rounded-lg border border-slate-700 relative group">
                        {isImagesLoading ? <LoadingSpinner message="Loading images..." /> :
                         storeImages.length > 0 ? (
                            <div className="flex h-full animate-scroll-gallery group-hover:[animation-play-state:paused]">
                                {storeImages.map((url, index) => (
                                    <div key={index} className="w-64 h-full flex-shrink-0 mx-2">
                                        <img src={url} alt={`Store image ${index + 1}`} className="w-full h-full object-cover rounded-md"/>
                                    </div>
                                ))}
                            </div>
                         ) : <p className="text-slate-500 text-center flex items-center justify-center h-full">No images found.</p>}
                    </div>

                    {performanceData && (
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
                            <h4 className="font-bold text-slate-300 mb-2">Quick Stats (This Period)</h4>
                            <QuickStat kpi={Kpi.Sales} value={performanceData[Kpi.Sales]} />
                            <QuickStat kpi={Kpi.SOP} value={performanceData[Kpi.SOP]} />
                            <QuickStat kpi={Kpi.PrimeCost} value={performanceData[Kpi.PrimeCost]} />
                            <QuickStat kpi={Kpi.AvgReviews} value={performanceData[Kpi.AvgReviews]} />
                        </div>
                    )}
                </div>

                {/* Right Column: AI Analysis Tabs */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-shrink-0 flex border-b border-slate-700">
                        {tabConfig.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                            >
                                <Icon name={tab.icon} className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 p-4 bg-slate-800 rounded-b-lg overflow-y-auto custom-scrollbar min-h-0">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </Modal>
    );
};