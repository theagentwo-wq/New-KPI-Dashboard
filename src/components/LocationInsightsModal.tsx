
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from './Modal';
import { callGeminiAPI, getPlaceDetails } from '../lib/ai-client';
import { get7DayForecastForLocation, getWeatherForLocation } from '../services/weatherService';
import { getPerformanceData } from '../services/firebaseService';
import { marked } from 'marked';
import { PerformanceData, Kpi, DailyForecast } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherIcon } from './WeatherIcon';
import { Icon } from './Icon';
import { DIRECTORS, KPI_CONFIG, KPI_ICON_MAP } from '../constants';

interface PlaceDetails {
  name: string;
  rating?: number;
  reviews?: any[];
  website?: string;
  url?: string;
  photoUrls?: string[];
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
}

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

export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location, performanceData, userLocation }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('reviews');
    const [activeVisualTab, setActiveVisualTab] = useState<VisualTab>('details');
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isPlaceDetailsLoading, setIsPlaceDetailsLoading] = useState(false);
    const [placeDetailsError, setPlaceDetailsError] = useState<string | null>(null);
    const [analysisContent, setAnalysisContent] = useState<{ [key in AnalysisTab]?: any }>({});
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<{ [key in AnalysisTab]?: boolean }>({});
    const [loadingAudience, setLoadingAudience] = useState<Audience | null>(null);
  
    const director = useMemo(() => location ? DIRECTORS.find(d => d.stores.includes(location)) : null, [location]);

    const resetState = () => {
        setIsFullScreen(false); setActiveAnalysisTab('reviews'); setActiveVisualTab('details');
        setAnalysisContent({}); setIsLoadingAnalysis({});
        setPlaceDetails(null); setIsPlaceDetailsLoading(false); setPlaceDetailsError(null);
    };

    useEffect(() => {
        if (isOpen && location) {
            const fetchInitialData = async () => {
                try {
                    setIsPlaceDetailsLoading(true); setPlaceDetailsError(null);
                    // Use business name search for consistent, accurate results
                    // Same format as Street View: "Tupelo Honey Southern Kitchen and Bar [City, State]"
                    const searchQuery = `Tupelo Honey Southern Kitchen and Bar ${location}`;
                    const details = await getPlaceDetails(searchQuery);
                    setPlaceDetails(details);
                } catch (error) {
                    const msg = error instanceof Error ? error.message : "An unknown error occurred.";
                    setPlaceDetailsError(`Could not load location details. ${msg}`);
                } finally {
                    setIsPlaceDetailsLoading(false);
                }
            };
            fetchInitialData();
        } else if (!isOpen) {
            resetState();
        }
    }, [isOpen, location]);

    const handleAnalysis = useCallback(async (type: AnalysisTab, currentPlaceDetails: PlaceDetails | null, audience?: Audience) => {
        if (!location) return;
        setIsLoadingAnalysis(prev => ({ ...prev, [type]: true }));
        if (type === 'brief' && audience) setLoadingAudience(audience);

        // Use full restaurant name + location for all API calls
        const fullLocationName = `Tupelo Honey Southern Kitchen and Bar ${location}`;

        let result: any = null;
        try {
            switch (type) {
                case 'reviews':
                    if (currentPlaceDetails?.name && currentPlaceDetails?.reviews && currentPlaceDetails.reviews.length > 0) {
                        result = await callGeminiAPI('getReviewSummary', { locationName: fullLocationName, reviews: currentPlaceDetails.reviews });
                    } else {
                        throw new Error("No reviews are available to analyze for this location.");
                    }
                    break;
                case 'market':
                    result = await callGeminiAPI('getLocationMarketAnalysis', { locationName: fullLocationName });
                    break;
                case 'brief': {
                    const weather = await getWeatherForLocation(location);
                    if (performanceData && audience) {
                        result = await callGeminiAPI('generateHuddleBrief', { locationName: fullLocationName, performanceData, audience, weather });
                    }
                    break;
                }
                case 'forecast': {
                    const forecastData = await get7DayForecastForLocation(location);
                    if (forecastData) {
                         // Fetch historical sales data from Firestore
                         let historicalDataSummary = 'N/A';
                         try {
                             const allPerformanceData = await getPerformanceData();
                             // Filter for this location
                             const locationData = allPerformanceData.filter(d => d.storeId === location);

                             if (locationData.length > 0) {
                                 // Sort by date descending (most recent first)
                                 locationData.sort((a, b) => {
                                     const dateA = new Date(a.year, a.month - 1, a.day);
                                     const dateB = new Date(b.year, b.month - 1, b.day);
                                     return dateB.getTime() - dateA.getTime();
                                 });

                                 // Get last 5 weeks of data
                                 const recentWeeks = locationData.slice(0, 5);
                                 const recentSales: number[] = recentWeeks
                                     .map(w => w.data.Sales)
                                     .filter((s): s is number => s !== undefined && s > 0);

                                 // Get YOY data (same weeks from last year)
                                 const currentYear = new Date().getFullYear();
                                 const lastYearData = locationData.filter(d =>
                                     d.year === currentYear - 1 &&
                                     d.data.Sales !== undefined &&
                                     d.data.Sales > 0
                                 );
                                 const yoySales: number[] = lastYearData.slice(0, 5)
                                     .map(w => w.data.Sales)
                                     .filter((s): s is number => s !== undefined);

                                 // Calculate averages
                                 const recentAvg = recentSales.length > 0
                                     ? recentSales.reduce((sum, val) => sum + val, 0) / recentSales.length
                                     : 0;
                                 const yoyAvg = yoySales.length > 0
                                     ? yoySales.reduce((sum, val) => sum + val, 0) / yoySales.length
                                     : 0;

                                 // Format summary for AI
                                 historicalDataSummary = JSON.stringify({
                                     recentWeeksCount: recentSales.length,
                                     recentWeeklyAverage: Math.round(recentAvg),
                                     recentWeeklySales: recentSales.map(s => Math.round(s)),
                                     yoyWeeksCount: yoySales.length,
                                     yoyWeeklyAverage: Math.round(yoyAvg),
                                     yoyChange: yoyAvg > 0 ? `${(((recentAvg - yoyAvg) / yoyAvg) * 100).toFixed(1)}%` : 'N/A'
                                 }, null, 2);
                             }
                         } catch (error) {
                             console.error('Error fetching historical data:', error);
                             // Continue with 'N/A' if fetch fails
                         }

                         const aiForecast = await callGeminiAPI('getSalesForecast', {
                             locationName: fullLocationName,
                             weatherForecast: forecastData,
                             historicalData: historicalDataSummary
                         });
                         result = { ...aiForecast, sevenDay: forecastData };
                    } else {
                        throw new Error("7-day weather forecast is currently unavailable.");
                    }
                    break;
                }
                case 'marketing':
                    result = await callGeminiAPI('getMarketingIdeas', { locationName: fullLocationName, userLocation });
                    break;
            }
            if (type !== 'forecast' && typeof result === 'string') result = await marked.parse(result);

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
    }, [location, performanceData, userLocation]);
    
    // Reviews tab: Wait for user to click "Generate Analysis" button instead of auto-loading
    // (Removed auto-load useEffect)

    const analysisTabConfig = [
        { id: 'reviews', label: 'Reviews & Buzz', icon: 'reviews' },
        { id: 'market', label: 'Local Market', icon: 'sop' },
        { id: 'brief', label: 'Hot Topics', icon: 'news' },
        { id: 'forecast', label: 'Forecast', icon: 'sales' },
        { id: 'marketing', label: 'Marketing', icon: 'sparkles' },
    ] as const;
    
    const renderVisualContent = () => {
        if (activeVisualTab === 'streetview') {
            // Street View - use formatted_address from Places API for most reliable results
            // Wait for placeDetails to load
            if (isPlaceDetailsLoading) {
                return <LoadingSpinner message="Loading location details..." />;
            }

            if (placeDetailsError || !placeDetails) {
                return (
                    <div className="h-full w-full bg-slate-800 flex flex-col items-center justify-center text-center p-4">
                        <h4 className="font-bold text-yellow-400">Map Unavailable</h4>
                        <p className="text-slate-500 text-xs mt-1">Could not load location details.</p>
                    </div>
                );
            }

            // Street View Embed API tested with all formats - NONE work:
            // ❌ Business names - rejected
            // ❌ Street addresses - rejected
            // ❌ Coordinates - rejected
            // ❌ Plus Codes - rejected (400 Bad Request)
            //
            // Solution: Use place mode with place_id (most reliable)
            // This shows an interactive map where users can click pegman to enter Street View

            const placeId = (placeDetails as any).place_id;
            if (placeId) {
                // Use Google Maps "place" mode - shows interactive map with Street View access
                // User can click the Street View pegman icon to enter Street View mode
                const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_MAPS_KEY}&q=place_id:${placeId}&zoom=19&maptype=satellite`;
                return <iframe title="Google Maps - Click pegman for Street View" className="w-full h-full border-0" loading="lazy" allowFullScreen src={embedUrl}></iframe>;
            }

            // No place ID available
            return (
                <div className="h-full w-full bg-slate-800 flex flex-col items-center justify-center text-center p-4">
                    <h4 className="font-bold text-yellow-400">Map View Unavailable</h4>
                    <p className="text-slate-500 text-xs mt-1">Location data not available.</p>
                </div>
            );
        }

        if (isPlaceDetailsLoading) return <LoadingSpinner message="Loading location details..." />;
        if (placeDetailsError) return <div className="h-full w-full bg-slate-800 flex flex-col items-center justify-center text-center p-4"><h4 className="font-bold text-red-400">Could not load location details.</h4><p className="text-slate-500 text-xs mt-1 break-all">{placeDetailsError}</p></div>;
        
        if (placeDetails) {
            const photos = placeDetails.photoUrls || [];
            return (
                <div className="h-full flex flex-col">
                    <div className="p-3">
                        <h4 className="font-bold text-base text-white">{placeDetails.name}</h4>
                        {placeDetails.rating && (
                            <div className="flex items-center gap-1 text-sm">
                                <span className="font-bold text-yellow-400">{placeDetails.rating.toFixed(1)}</span>
                                <Icon name="reviews" className="w-4 h-4 text-yellow-400" />
                            </div>
                        )}
                    </div>
                    {photos.length > 0 ? (
                        <div className="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap custom-scrollbar">
                            {photos.map((url, i) => 
                                <img key={i} src={url} alt={`Photo ${i + 1} of ${placeDetails.name}`} className="inline-block h-full w-auto object-cover rounded-b-lg" />
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 p-4">No photos available.</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderAnalysisTabContent = () => {
        const content = analysisContent[activeAnalysisTab];
        const loading = isLoadingAnalysis[activeAnalysisTab];
        if (loading) return <LoadingSpinner message={`Generating ${activeAnalysisTab} analysis...`} />;

        if (activeAnalysisTab === 'brief') {
            const audiences: Audience[] = ['FOH', 'BOH', 'Managers'];
            return <div className="space-y-4"><p className="text-sm text-slate-300">Generate hot topics and pre-shift talking points tailored to a specific team, including performance data, weather, and local context.</p><div className="flex flex-wrap gap-2">{audiences.map(aud => <button key={aud} onClick={() => handleAnalysis('brief', placeDetails, aud)} disabled={loading} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-slate-700 disabled:opacity-50">{loading && loadingAudience === aud ? <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg> : <Icon name="news" className="w-4 h-4" />}<span>Generate for <span className="font-bold">{aud}</span></span></button>)}</div>{content && Object.keys(content).length > 0 && <div className="space-y-4 pt-4 border-t border-slate-700">{(Object.keys(content) as Audience[]).map(aud => <div key={aud}><h4 className="font-bold text-cyan-400">Hot Topics for {aud}</h4><div className="prose prose-sm prose-invert max-w-none text-slate-200 mt-2" dangerouslySetInnerHTML={{ __html: content[aud] }} /></div>)}</div>}</div>;
        }

        if (activeAnalysisTab === 'forecast') {
             if (content?.summary && content?.chartData) {
                const getTrafficColor = (level: string) => {
                    switch(level) {
                        case 'VERY HIGH': return 'text-red-400';
                        case 'HIGH': return 'text-orange-400';
                        case 'MEDIUM': return 'text-yellow-400';
                        case 'LOW': return 'text-slate-400';
                        default: return 'text-slate-400';
                    }
                };

                return (
                    <div className="space-y-6">
                        {/* Overview Summary */}
                        <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: marked.parse(content.summary) }} />

                        {/* Sales Forecast Chart */}
                        <div>
                            <h4 className="font-semibold text-slate-300 mb-2">7-Day Sales Forecast</h4>
                            <div style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={content.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${(val / 1000)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                        itemStyle={{ color: '#22d3ee' }}
                                        formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                                    />
                                    <Line type="monotone" dataKey="salesLow" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                                    <Line type="monotone" dataKey="salesMid" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="salesHigh" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                                </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 text-center">Solid line shows midpoint, dashed lines show forecast range</p>
                        </div>

                        {/* Daily Breakdown Cards */}
                        {content.dailyBreakdown && content.dailyBreakdown.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-3">Daily Breakdown</h4>
                                <div className="space-y-4">
                                    {content.dailyBreakdown.map((day: any, index: number) => (
                                        <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-bold text-white">{day.fullDate}</h5>
                                                    <p className="text-2xl font-bold text-cyan-400 mt-1">{day.salesRange}</p>
                                                    <p className="text-xs text-slate-400">{day.variance}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-bold ${getTrafficColor(day.trafficLevel)}`}>
                                                        {day.trafficLevel} TRAFFIC
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Weather Impact</p>
                                                    <p className="text-sm text-slate-300">{day.weatherImpact}</p>
                                                </div>

                                                {day.events && day.events.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Local Events</p>
                                                        <ul className="text-sm text-slate-300 space-y-0.5">
                                                            {day.events.map((event: string, i: number) => (
                                                                <li key={i}>• {event}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {day.rushPeriods && day.rushPeriods.length > 0 && (
                                                <div className="pt-2">
                                                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Expected Rush Periods</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {day.rushPeriods.map((period: string, i: number) => (
                                                            <span key={i} className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
                                                                {period}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {day.recommendations && day.recommendations.length > 0 && (
                                                <div className="pt-2">
                                                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Operational Recommendations</p>
                                                    <ul className="text-sm text-slate-300 space-y-0.5">
                                                        {day.recommendations.map((rec: string, i: number) => (
                                                            <li key={i}>✓ {rec}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weather Outlook */}
                        {content.sevenDay && (
                        <div>
                            <h4 className="font-semibold text-slate-300 mb-2">7-Day Weather Outlook</h4>
                            <div className="grid grid-cols-7 gap-2 text-center">
                            {content.sevenDay.map((day: DailyForecast, i: number) => (
                                <div key={i} className="bg-slate-900/50 p-2 rounded-lg flex flex-col items-center">
                                <p className="font-bold text-sm text-slate-300">{day.day}</p>
                                <WeatherIcon condition={day.condition} className="w-8 h-8 my-1" />
                                <p className="font-semibold text-cyan-400">{day.temp}°F</p>
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                );
             }
        }
        
        if (content) return <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: content }} />;

        const tabConfigItem = analysisTabConfig.find(t => t.id === activeAnalysisTab);
        
        if (activeAnalysisTab === 'reviews' && placeDetails && (!placeDetails.reviews || placeDetails.reviews.length === 0)) {
            return <div className="text-center flex flex-col items-center justify-center h-full"><Icon name='reviews' className="w-12 h-12 text-slate-600 mb-4" /><h4 className="font-bold text-slate-300">No Reviews Available</h4><p className="text-sm text-slate-400 mt-1 max-w-sm">There are no Google reviews to analyze for this location.</p></div>;
        }

        return <div className="text-center flex flex-col items-center justify-center h-full"><Icon name={tabConfigItem?.icon || 'sparkles'} className="w-12 h-12 text-slate-600 mb-4" /><h4 className="font-bold text-slate-300">Analyze {tabConfigItem?.label}</h4><p className="text-sm text-slate-400 mt-1 max-w-sm">Get AI-powered insights for this location. Click the button below to generate the analysis.</p><button onClick={() => handleAnalysis(activeAnalysisTab, placeDetails)} className="mt-6 flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"><Icon name="sparkles" className="w-4 h-4" />Generate Analysis</button></div>;
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
                    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden flex flex-col"><div className="flex-shrink-0 flex border-b border-slate-700"><button onClick={() => setActiveVisualTab('details')} className={`flex-1 px-3 py-1.5 text-xs font-semibold ${activeVisualTab === 'details' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Details & Photos</button><button onClick={() => setActiveVisualTab('streetview')} className={`flex-1 px-3 py-1.5 text-xs font-semibold ${activeVisualTab === 'streetview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Map</button></div><div className="flex-1 min-h-0">{renderVisualContent()}</div></div>
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
