import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast, getLocationMarketAnalysis, getMarketingIdeas, getReviewSummary, getMapsApiKey, getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { get7DayForecastForLocation, getWeatherForLocation } from '../services/weatherService';
import { marked } from 'marked';
import { PerformanceData, Kpi, StoreDetails, DailyForecast } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherIcon } from './WeatherIcon';
import { Icon } from './Icon';
import { DIRECTORS, KPI_CONFIG, KPI_ICON_MAP, STORE_DETAILS } from '../constants';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
  performanceData?: PerformanceData;
  userLocation?: { latitude: number; longitude: number } | null;
}

type AnalysisTab = 'reviews' | 'market' | 'brief' | 'forecast' | 'marketing';
type Audience = 'FOH' | 'BOH' | 'Managers';
type VisualTab = 'details' | 'streetview';

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

const QuickStat: React.FC<{ kpi: Kpi; value?: number }> = ({ kpi, value }) => {
    if (value === undefined || isNaN(value)) return null;
    const config = KPI_CONFIG[kpi];
    let formattedValue: string;
    switch (config.format) {
        case 'currency': formattedValue = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); break;
        case 'percent': formattedValue = `${(value * 100).toFixed(1)}%`; break;
        case 'number': formattedValue = value.toFixed(2); break;
        default: formattedValue = value.toString();
    }
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-400"> <Icon name={KPI_ICON_MAP[kpi]} className="w-4 h-4" /> <span>{kpi}</span> </div>
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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('reviews');
    const [activeVisualTab, setActiveVisualTab] = useState<VisualTab>('details');
    const [mapsApiKey, setMapsApiKey] = useState<string | null>(null);
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isPlaceDetailsLoading, setIsPlaceDetailsLoading] = useState(false);
    const [placeDetailsError, setPlaceDetailsError] = useState<string | null>(null);
    const [analysisContent, setAnalysisContent] = useState<{ [key in AnalysisTab]?: any }>({});
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<{ [key in AnalysisTab]?: boolean }>({});
    const [loadingAudience, setLoadingAudience] = useState<Audience | null>(null);
  
    const director = useMemo(() => location ? DIRECTORS.find(d => d.stores.includes(location)) : null, [location]);
    const storeDetails: StoreDetails | undefined = useMemo(() => location ? STORE_DETAILS[location] : undefined, [location]);

    const resetState = () => {
        setIsFullScreen(false); setActiveAnalysisTab('reviews'); setActiveVisualTab('details');
        setAnalysisContent({}); setIsLoadingAnalysis({}); setMapsApiKey(null);
        setPlaceDetails(null); setIsPlaceDetailsLoading(false); setPlaceDetailsError(null);
    };

    useEffect(() => {
        if (isOpen && location && storeDetails) {
            const fetchInitialData = async () => {
                try {
                    const key = await getMapsApiKey(); setMapsApiKey(key);
                    setIsPlaceDetailsLoading(true); setPlaceDetailsError(null);
                    const details = await getPlaceDetails(storeDetails.address);
                    setPlaceDetails(details);
                } catch (error) {
                    const msg = error instanceof Error ? error.message : "An unknown error occurred.";
                    setPlaceDetailsError(`Failed to load location details: ${msg}`);
                } finally {
                    setIsPlaceDetailsLoading(false);
                }
            };
            fetchInitialData();
        } else {
            if (!storeDetails && isOpen) {
                setPlaceDetailsError("Address information unavailable for this location.");
            }
            if (!isOpen) resetState();
        }
    }, [isOpen, location, storeDetails]);

    const handleAnalysis = async (type: AnalysisTab, audience?: Audience) => {
        if (!location) return;
        setIsLoadingAnalysis(prev => ({ ...prev, [type]: true }));
        if (type === 'brief' && audience) setLoadingAudience(audience);

        let result: any = null;
        try {
            switch (type) {
                case 'reviews': 
                    if (placeDetails?.reviews) {
                        result = await getReviewSummary(placeDetails.name, placeDetails.reviews);
                    } else {
                        throw new Error("Location name and reviews are required.");
                    }
                    break;
                case 'market': result = await getLocationMarketAnalysis(location); break;
                case 'brief': {
                    const weather = await getWeatherForLocation(location);
                    if (performanceData && audience) {
                        result = await generateHuddleBrief(location, performanceData, audience, weather);
                    }
                    break;
                }
                case 'forecast': {
                    const forecastData = await get7DayForecastForLocation(location);
                    if (forecastData) {
                        result = {
                            chartData: await getSalesForecast(location, forecastData),
                            sevenDay: forecastData
                        };
                    } else {
                        throw new Error("7-day weather forecast is currently unavailable.");
                    }
                    break;
                }
                case 'marketing': result = await getMarketingIdeas(location, userLocation); break;
            }
            if (typeof result === 'string') result = await marked.parse(result);
        } catch (error) {
            console.error(`Error fetching analysis for ${type}:`, error);
            const errorMsg = error instanceof Error ? error.message : 'Could not generate results.';
            result = `<p class="text-red-400">Request failed: ${errorMsg}</p>`;
        }
        
        if (type === 'brief' && audience) {
            setAnalysisContent(prev => ({ ...prev, brief: { ...(prev.brief || {}), [audience]: result } }));
        } else {
            setAnalysisContent(prev => ({ ...prev, [type]: result }));
        }

        setIsLoadingAnalysis(prev => ({ ...prev, [type]: false }));
        if (type === 'brief') setLoadingAudience(null);
    };
    
    useEffect(() => {
        if (placeDetails && !analysisContent.reviews) {
            handleAnalysis('reviews');
        }
    }, [placeDetails]);

    const analysisTabConfig = [
        { id: 'reviews', label: 'Reviews & Buzz', icon: 'reviews' },
        { id: 'market', label: 'Local Market', icon: 'sop' },
        { id: 'brief', label: 'Huddle Brief', icon: 'news' },
        { id: 'forecast', label: 'Forecast', icon: 'sales' },
        { id: 'marketing', label: 'Marketing', icon: 'sparkles' },
    ] as const;
    
    const renderVisualContent = () => {
        if (!storeDetails) return <div className="h-full w-full bg-slate-800 flex flex-col items-center justify-center text-center p-4"><h4 className="font-bold text-yellow-400">Location data missing.</h4><p className="text-slate-500 text-xs mt-1">Address details not found for {location}.</p></div>;

        if (activeVisualTab === 'streetview') {
            if (!mapsApiKey) return <LoadingSpinner message="Loading Street View..." />;
            const embedUrl = `https://www.google.com/maps/embed/v1/streetview?key=${mapsApiKey}&location=${storeDetails.lat},${storeDetails.lon}&heading=210&pitch=10&fov=75`;
            return <iframe title="Google Street View" className="w-full h-full border-0" loading="lazy" allowFullScreen src={embedUrl}></iframe>;
        }
        if (isPlaceDetailsLoading) return <LoadingSpinner message="Loading location details..." />;
        if (placeDetailsError) return <div className="h-full w-full bg-slate-800 flex flex-col items-center justify-center text-center p-4"><h4 className="font-bold text-red-400">Could not load location details.</h4><p className="text-slate-500 text-xs mt-1 break-all">{placeDetailsError}</p></div>;
        if (placeDetails) {
            return <div className="h-full flex flex-col"><div className="p-3"><h4 className="font-bold text-base text-white">{placeDetails.name}</h4>{placeDetails.rating && <div className="flex items-center gap-1 text-sm"><span className="font-bold text-yellow-400">{placeDetails.rating.toFixed(1)}</span><Icon name="reviews" className="w-4 h-4 text-yellow-400" /></div>}</div>{placeDetails.photoUrls?.length > 0 ? <div className="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap custom-scrollbar">{placeDetails.photoUrls.map((url, i) => <img key={i} src={url} alt={`Photo ${i + 1} of ${placeDetails.name}`} className="inline-block h-full w-auto object-cover rounded-b-lg" />)}</div> : <p className="text-center text-slate-500 p-4">No photos available.</p>}</div>;
        }
        return null;
    };

    const renderAnalysisTabContent = () => {
        const content = analysisContent[activeAnalysisTab];
        const loading = isLoadingAnalysis[activeAnalysisTab];
        if (loading) return <LoadingSpinner message={`Generating ${activeAnalysisTab} analysis...`} />;

        if (activeAnalysisTab === 'brief') {
            const audiences: Audience[] = ['FOH', 'BOH', 'Managers'];
            return <div className="space-y-4"><p className="text-sm text-slate-300">Generate a pre-shift huddle brief tailored to a specific team, including weather and holiday context.</p><div className="flex flex-wrap gap-2">{audiences.map(aud => <button key={aud} onClick={() => handleAnalysis('brief', aud)} disabled={loading} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-slate-700 disabled:opacity-50">{loading && loadingAudience === aud ? <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg> : <Icon name="news" className="w-4 h-4" />}<span>Generate for <span className="font-bold">{aud}</span></span></button>)}</div>{content && Object.keys(content).length > 0 && <div className="space-y-4 pt-4 border-t border-slate-700">{(Object.keys(content) as Audience[]).map(aud => <div key={aud}><h4 className="font-bold text-cyan-400">Brief for {aud}</h4><div className="prose prose-sm prose-invert max-w-none text-slate-200 mt-2" dangerouslySetInnerHTML={{ __html: content[aud] }} /></div>)}</div>}</div>;
        }

        if (activeAnalysisTab === 'forecast') {
            return content?.chartData ? (
                <div>
                    <div className="mb-6"><h4 className="text-md font-bold text-slate-300 mb-2">7-Day Weather Forecast</h4><div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-center">{content.sevenDay.map((day: DailyForecast) => <div key={day.date} className="p-2 bg-slate-900/50 rounded-md"><p className="text-xs text-slate-400 font-semibold">{day.date.split(',')[0]}</p><WeatherIcon condition={day.condition} className="w-8 h-8 mx-auto my-1" /><p className="text-sm font-bold text-white">{day.temperature}°</p></div>)}</div></div>
                    <div><h4 className="text-md font-bold text-slate-300 mb-2">AI Sales Forecast</h4>{content.chartData.length > 0 ? <ResponsiveContainer width="100%" height={250}><LineChart data={content.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="date" stroke="#9ca3af" fontSize="12" /><YAxis stroke="#9ca3af" fontSize="12" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="predictedSales" stroke="#22d3ee" strokeWidth={2} name="Predicted Sales" dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer> : <p className="text-center text-slate-400 py-8">Sales forecast data is currently unavailable.</p>}</div>
                </div>
            ) : <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        
        if (content) return <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: content }} />;

        return <LoadingSpinner message="Preparing analysis..." />;
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Store Hub: ${location}`} 
            size={isFullScreen ? 'fullscreen' : 'large'}
            headerControls={<button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white"><Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" /></button>}
        >
            <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="md:w-1/3 space-y-4 flex flex-col flex-shrink-0">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"><h3 className="font-bold text-lg text-white">{location}</h3>{director && <div className="flex items-center gap-2 mt-2 text-sm"><img src={director.photo} alt={director.name} className="w-8 h-8 rounded-full object-cover" /><div><p className="text-slate-400">Area Director</p><p className="font-semibold text-cyan-400">{director.name} {director.lastName}</p></div></div>}</div>
                    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden flex flex-col"><div className="flex-shrink-0 flex border-b border-slate-700"><button onClick={() => setActiveVisualTab('details')} className={`flex-1 px-3 py-1.5 text-xs font-semibold ${activeVisualTab === 'details' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Details & Photos</button><button onClick={() => setActiveVisualTab('streetview')} className={`flex-1 px-3 py-1.5 text-xs font-semibold ${activeVisualTab === 'streetview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Street View</button></div><div className="flex-1 min-h-0">{renderVisualContent()}</div></div>
                    {performanceData && <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2"><h4 className="font-bold text-slate-300 mb-2">Quick Stats (This Period)</h4><QuickStat kpi={Kpi.Sales} value={performanceData[Kpi.Sales]} /><QuickStat kpi={Kpi.SOP} value={performanceData[Kpi.SOP]} /><QuickStat kpi={Kpi.PrimeCost} value={performanceData[Kpi.PrimeCost]} /><QuickStat kpi={Kpi.AvgReviews} value={performanceData[Kpi.AvgReviews]} /></div>}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-shrink-0 flex border-b border-slate-700 overflow-x-auto custom-scrollbar">{analysisTabConfig.map(tab => <button key={tab.id} onClick={() => setActiveAnalysisTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeAnalysisTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'}`}><Icon name={tab.icon} className="w-4 h-4" />{tab.label}</button>)}</div>
                    <div className="flex-1 p-4 bg-slate-800 rounded-b-lg overflow-y-auto custom-scrollbar min-h-0">{renderAnalysisTabContent()}</div>
                </div>
            </div>
        </Modal>
    );
};