import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { generateHuddleBrief, getSalesForecast, getLocationMarketAnalysis, getMarketingIdeas, getReviewSummary, getStreetViewMetadata, getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { get7DayForecastForLocation } from '../services/weatherService';
import { marked } from 'marked';
import { PerformanceData, ForecastDataPoint, WeatherCondition, Kpi, StoreDetails } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
type StreetViewStatus = 'loading' | 'OK' | 'ZERO_RESULTS' | 'ERROR';

type StreetViewData = {
    status: StreetViewStatus;
    lat?: number;
    lon?: number;
};

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
    let formattedValue: string;

    switch (config.format) {
        case 'currency':
            formattedValue = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
            break;
        case 'percent':
            formattedValue = `${(value * 100).toFixed(1)}%`;
            break;
        case 'number':
            formattedValue = value.toFixed(2);
            break;
        default:
            formattedValue = value.toString();
    }

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

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const starIcon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">{starIcon}</span>)}
            {/* Note: Half-star rendering is complex, so we'll represent it as a full star for simplicity here but acknowledge the fractional rating */}
            {halfStar && <span className="text-yellow-400">{starIcon}</span>}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-slate-600">{starIcon}</span>)}
        </div>
    );
};

// --- Main Modal Component ---

export const LocationInsightsModal: React.FC<LocationInsightsModalProps> = ({ isOpen, onClose, location, performanceData, userLocation }) => {
    // State for UI and data
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeTab, setActiveTab] = useState<AnalysisTab>('reviews');
    
    // State for data fetching
    const [streetViewData, setStreetViewData] = useState<StreetViewData>({ status: 'loading' });
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isPlaceDetailsLoading, setIsPlaceDetailsLoading] = useState(true);

    // State for each analysis tab (lazy-loaded)
    const [analysisContent, setAnalysisContent] = useState<{ 
        reviews?: any;
        market?: any;
        brief?: { [key in Audience]?: any };
        forecast?: any;
        marketing?: any;
    }>({});
    const [isLoading, setIsLoading] = useState<{ [key in AnalysisTab]?: boolean }>({});
    const [loadingAudience, setLoadingAudience] = useState<Audience | null>(null);
  
    const director = useMemo(() => {
        if (!location) return null;
        return DIRECTORS.find(d => d.stores.includes(location));
    }, [location]);

    const storeDetails: StoreDetails | undefined = useMemo(() => {
        if (!location) return undefined;
        return STORE_DETAILS[location];
    }, [location]);


    // Reset all state when the modal is closed or the location changes
    useEffect(() => {
        if (!isOpen) {
            setIsFullScreen(false);
            setActiveTab('reviews');
        } else if (location && storeDetails) {
            setAnalysisContent({});
            setIsLoading({});
            setStreetViewData({ status: 'loading' });
            setPlaceDetails(null);
            setIsPlaceDetailsLoading(true);
            
            const fetchInitialVisuals = async () => {
                // Fetch StreetView and PlaceDetails in parallel
                const svPromise = getStreetViewMetadata(storeDetails.address, storeDetails.lat, storeDetails.lon);
                const pdPromise = getPlaceDetails(location, storeDetails.address);

                const [svMeta, details] = await Promise.all([svPromise, pdPromise]);

                if (svMeta.status === 'OK') {
                    setStreetViewData({ status: 'OK', lat: svMeta.lat, lon: svMeta.lon });
                } else {
                    setStreetViewData({ status: svMeta.status as StreetViewStatus, lat: svMeta.lat, lon: svMeta.lon });
                }
                
                setPlaceDetails(details);
                setIsPlaceDetailsLoading(false);
            };

            fetchInitialVisuals();
        }
    }, [isOpen, location, storeDetails]);

    const handleAnalysis = async (type: AnalysisTab, audience?: Audience) => {
        if (!location) return;
        setIsLoading(prev => ({ ...prev, [type]: true }));
        if (type === 'brief' && audience) {
            setLoadingAudience(audience);
        }

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
        
        if (type === 'brief' && audience) {
            setAnalysisContent(prev => ({
                ...prev,
                brief: {
                    ...prev.brief,
                    [audience]: result
                }
            }));
        } else {
            setAnalysisContent(prev => ({ ...prev, [type]: result }));
        }

        setIsLoading(prev => ({ ...prev, [type]: false }));
        if (type === 'brief') {
            setLoadingAudience(null);
        }
    };
    
    const tabConfig: { id: AnalysisTab; label: string; icon: string }[] = [
        { id: 'reviews', label: 'Reviews & Buzz', icon: 'reviews' },
        { id: 'market', label: 'Local Market', icon: 'sop' },
        { id: 'brief', label: 'Huddle Brief', icon: 'news' },
        { id: 'forecast', label: 'Forecast', icon: 'sales' },
        { id: 'marketing', label: 'Marketing', icon: 'sparkles' },
    ];
    
    const renderStreetView = () => {
        const { status, lat, lon } = streetViewData;
        const containerClasses = "h-40 w-full overflow-hidden rounded-t-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm";
        
        switch (status) {
            case 'loading':
                return (
                    <div className={containerClasses}>
                        <svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                );
            case 'OK':
                if (!lat || !lon) return null;
                return (
                    <div className={containerClasses}>
                        <iframe
                            key={`sv-${lat}-${lon}`}
                            title="Google Maps Street View"
                            className="w-full h-full border-0"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps?q&layer=c&cbll=${lat},${lon}&cbp=12,0,0,0,0&output=svembed`}>
                        </iframe>
                    </div>
                );
            case 'ZERO_RESULTS':
            case 'ERROR':
                if (!lat || !lon) {
                     return (
                        <div className={containerClasses}>
                            Street View and map are unavailable.
                        </div>
                    );
                }
                return (
                    <div className={`${containerClasses} relative`}>
                         <iframe
                            key={`map-${lat}-${lon}`}
                            title="Google Maps Satellite View"
                            className="w-full h-full border-0"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps?q=${lat},${lon}&z=18&t=k&output=embed`}>
                        </iframe>
                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs p-1 rounded">
                           Interactive Street View not available. Showing satellite map.
                        </div>
                    </div>
                );
        }
    }

    const renderLocationDetails = () => {
        if (isPlaceDetailsLoading) {
            return (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 min-h-[170px] flex items-center justify-center">
                    <LoadingSpinner message="Fetching location details..." />
                </div>
            );
        }

        if (!placeDetails) {
            return (
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 min-h-[170px] flex items-center justify-center text-center">
                    <p className="text-sm text-slate-400">Could not load location details from Google Maps.</p>
                </div>
            );
        }

        return (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-300">Location Details</h4>
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-white truncate pr-2">{placeDetails.name}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-bold text-yellow-400">{placeDetails.rating.toFixed(1)}</span>
                        <StarRating rating={placeDetails.rating} />
                    </div>
                </div>

                {placeDetails.photoUrls && placeDetails.photoUrls.length > 0 ? (
                     <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar -mx-4 px-4">
                         {placeDetails.photoUrls.map((url, index) => (
                             <img 
                                 key={index}
                                 src={url}
                                 alt={`Store photo ${index + 1}`}
                                 className="w-40 h-28 object-cover rounded-md flex-shrink-0 border-2 border-slate-700"
                             />
                         ))}
                     </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No photos available on Google Maps.</p>
                )}
            </div>
        );
    };

    const renderTabContent = () => {
        const content = analysisContent[activeTab];
        const loading = isLoading[activeTab];

        if (activeTab === 'brief') {
            const audiences: Audience[] = ['FOH', 'BOH', 'Managers'];
            const generatedBriefs = analysisContent.brief || {};
            
            return (
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">Generate a pre-shift huddle brief tailored to a specific team.</p>
                    <div className="flex flex-wrap gap-2">
                        {audiences.map(aud => (
                            <button
                                key={aud}
                                onClick={() => handleAnalysis('brief', aud)}
                                disabled={loading}
                                className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && loadingAudience === aud ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : <Icon name="news" className="w-4 h-4" />}
                                <span>Generate for <span className="font-bold">{aud}</span></span>
                            </button>
                        ))}
                    </div>
                    {Object.keys(generatedBriefs).length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-slate-700">
                             {(Object.keys(generatedBriefs) as Audience[]).map(aud => (
                                <div key={aud}>
                                    <h4 className="font-bold text-cyan-400">Brief for {aud}</h4>
                                    <div className="prose prose-sm prose-invert max-w-none text-slate-200 mt-2" dangerouslySetInnerHTML={{ __html: generatedBriefs[aud] }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (loading) {
            return <LoadingSpinner message={`Generating ${activeTab} analysis...`} />;
        }
        
        if (content) {
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
        }

        const tabConfigItem = tabConfig.find(t => t.id === activeTab);
        return (
             <div className="text-center flex flex-col items-center justify-center h-full">
                <Icon name={tabConfigItem?.icon || 'sparkles'} className="w-12 h-12 text-slate-600 mb-4" />
                <h4 className="font-bold text-slate-300">Analyze {tabConfigItem?.label}</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">Get AI-powered insights for this location. Click the button below to generate the analysis.</p>
                <button
                    onClick={() => handleAnalysis(activeTab)}
                    className="mt-6 flex items-center gap-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    <Icon name="sparkles" className="w-4 h-4" />
                    Generate Analysis
                </button>
            </div>
        );
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

                     {storeDetails ? (
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700">
                            {renderStreetView()}
                             <div className="p-3 text-sm">
                                <p className="font-semibold text-slate-300">{storeDetails.address}</p>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeDetails.address)}${userLocation ? `&origin=${userLocation.latitude},${userLocation.longitude}` : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                                >
                                    Get Directions &rarr;
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 text-sm text-slate-400">
                            Location details not found.
                        </div>
                    )}
                    
                    {renderLocationDetails()}

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