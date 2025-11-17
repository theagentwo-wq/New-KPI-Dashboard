import React, { useState, useMemo, useCallback, useEffect } from 'react';
// FIX: Add NoteCategory to the import to resolve type errors.
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, SavedView, Anomaly, Note, NoteCategory } from '../types';
// FIX: Add ALL_STORES to the import to resolve a missing variable error.
import { KPI_CONFIG, DIRECTORS, ALL_STORES, ALL_KPIS, KPI_ICON_MAP } from '../constants';
import { getInitialPeriod, ALL_PERIODS, getPreviousPeriod, getYoYPeriod } from '../utils/dateUtils';
import { generateDataForPeriod } from '../data/mockData';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { Icon } from '../components/Icon';
import { TimeSelector } from '../components/TimeSelector';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { AIAssistant } from '../components/AIAssistant';
import { NotesPanel } from '../components/NotesPanel';
import { LocationInsightsModal } from '../components/LocationInsightsModal';
import { CompanyStoreRankings } from '../components/CompanyStoreRankings';
import { AnimatedNumberDisplay } from '../components/AnimatedNumberDisplay';
import { AIAlerts } from '../components/AIAlerts';
import { AnomalyDetailModal } from '../components/AnomalyDetailModal';
import { getAnomalyDetections } from '../services/geminiService';
import { ReviewAnalysisModal } from '../components/ReviewAnalysisModal';
import { PerformanceMatrix } from '../components/PerformanceMatrix';

// Helper to format values for display
const formatDisplayValue = (value: number, kpi: Kpi) => {
    if (isNaN(value)) return 'N/A';
    const config = KPI_CONFIG[kpi];
    switch(config.format) {
        case 'currency': return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        case 'percent': return `${(value * 100).toFixed(1)}%`;
        case 'number': return value.toFixed(2);
        default: return value.toString();
    }
};

// KPICard Component
interface KPICardProps {
  title: Kpi;
  value: number;
  variance: number;
}
const KPICard: React.FC<KPICardProps> = ({ title, value, variance }) => {
    const animatedValue = useAnimatedNumber(value || 0);
    const kpiConfig = KPI_CONFIG[title];
    const iconName = KPI_ICON_MAP[title];

    const getVarianceColor = (v: number) => {
        if (isNaN(v) || v === 0) return 'text-slate-400';
        const isGood = kpiConfig.higherIsBetter ? v > 0 : v < 0;
        return isGood ? 'text-green-400' : 'text-red-400';
    };

    const formatter = useCallback((v: number) => {
        return formatDisplayValue(v, title)
    }, [title]);

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <div className="text-3xl font-bold text-slate-100 mt-1">
                    <AnimatedNumberDisplay value={animatedValue} formatter={formatter} />
                </div>
                <div className={`text-sm font-semibold mt-1 ${getVarianceColor(variance)}`}>
                    {variance >= 0 ? '+' : ''}{formatDisplayValue(variance, title)}
                </div>
            </div>
            <div className="bg-slate-700 p-2 rounded-md">
                <Icon name={iconName} className="w-6 h-6 text-cyan-400" />
            </div>
        </div>
    );
};

interface DashboardPageProps {
    currentView: View;
    notes: Note[];
    onAddNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string) => void;
    onUpdateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
    onDeleteNote: (noteId: string) => void;
    dbStatus: 'initializing' | 'connected' | 'error';
    loadedData: StorePerformanceData[];
    setLoadedData: React.Dispatch<React.SetStateAction<StorePerformanceData[]>>;
    budgets: Budget[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentView, notes, onAddNote, onUpdateNote, onDeleteNote, dbStatus, loadedData, setLoadedData, budgets }) => {
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isAnomalyModalOpen, setAnomalyModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | undefined>(undefined);

    useEffect(() => {
        const data = generateDataForPeriod(currentPeriod);
        setLoadedData(data);
    }, [currentPeriod, setLoadedData]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => { setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
            (error) => { console.warn("Geolocation permission denied:", error.message); }
        );
    }, []);

    const periodData = useMemo(() => loadedData.filter(d => d.weekStartDate >= currentPeriod.startDate && d.weekStartDate <= currentPeriod.endDate), [loadedData, currentPeriod]);

    const comparisonPeriod = useMemo(() => {
        switch (comparisonMode) {
            case 'vs. Prior Period': return getPreviousPeriod(currentPeriod);
            case 'vs. Last Year': return getYoYPeriod(currentPeriod);
            case 'vs. Budget': return currentPeriod;
            default: return undefined;
        }
    }, [comparisonMode, currentPeriod]);

    const comparisonData = useMemo(() => {
        if (!comparisonPeriod || comparisonMode === 'vs. Budget') return [];
        return generateDataForPeriod(comparisonPeriod);
    }, [comparisonPeriod, comparisonMode]);

    const directorStores = useMemo(() => {
        if (currentView === 'Total Company') return ALL_STORES;
        return DIRECTORS.find(d => d.id === currentView)?.stores || [];
    }, [currentView]);

    const filteredData = useMemo(() => periodData.filter(d => directorStores.includes(d.storeId)), [periodData, directorStores]);
    const filteredComparisonData = useMemo(() => comparisonData.filter(d => directorStores.includes(d.storeId)), [comparisonData, directorStores]);

    const aggregatePerformance = (data: StorePerformanceData[]): PerformanceData => {
        const totals = data.reduce((acc, curr) => {
            ALL_KPIS.forEach(kpi => {
                acc[kpi] = (acc[kpi] || 0) + curr.data[kpi];
            });
            return acc;
        }, {} as PerformanceData);

        ALL_KPIS.forEach(kpi => {
            const isAverage = ['percent', 'number'].includes(KPI_CONFIG[kpi].format);
            if (isAverage) {
                totals[kpi] = totals[kpi] / (data.length || 1);
            }
        });
        return totals;
    };
    
    const aggregatedData = useMemo(() => aggregatePerformance(filteredData), [filteredData]);
    const aggregatedComparisonData = useMemo(() => aggregatePerformance(filteredComparisonData), [filteredComparisonData]);
    
    const processDataForTable = (
        currentData: StorePerformanceData[],
        compData: StorePerformanceData[],
        budgetData: Budget[]
    ) => {
        const combined: { [storeId: string]: { actual: PerformanceData, comparison?: PerformanceData, variance: PerformanceData } } = {};
        const allStoresInPeriod = new Set(currentData.map(d => d.storeId));
        
        allStoresInPeriod.forEach(storeId => {
            const storeCurrentData = currentData.filter(d => d.storeId === storeId);
            const storeCompData = compData.filter(d => d.storeId === storeId);

            const actual = aggregatePerformance(storeCurrentData);
            let comparison: PerformanceData | undefined;
            
            if(comparisonMode === 'vs. Budget'){
                const year = currentPeriod.startDate.getFullYear();
                const monthMatch = currentPeriod.label.match(/P(\d+)/);
                if (monthMatch) {
                    const month = parseInt(monthMatch[1], 10);
                    comparison = budgetData.find(b => b.storeId === storeId && b.year === year && b.month === month)?.targets;
                }
            } else {
                 comparison = aggregatePerformance(storeCompData);
            }
            
            const variance = {} as PerformanceData;
            ALL_KPIS.forEach(kpi => {
                const actualValue = actual[kpi] || 0;
                const comparisonValue = comparison?.[kpi] || 0;
                variance[kpi] = comparisonValue !== 0 ? (actualValue - comparisonValue) : actualValue;
            });
            
            combined[storeId] = { actual, comparison, variance };
        });
        return combined;
    };

    const directorAggregates = useMemo(() => {
        const result: { [directorId: string]: any } = {};
        DIRECTORS.forEach(director => {
            const directorPeriodData = periodData.filter(d => director.stores.includes(d.storeId));
            const directorCompData = comparisonData.filter(d => director.stores.includes(d.storeId));
            result[director.name] = {
                aggregated: aggregatePerformance(directorPeriodData),
                comparison: aggregatePerformance(directorCompData),
                variance: {} 
            };
            ALL_KPIS.forEach(kpi => {
                result[director.name].variance[kpi] = (result[director.name].aggregated[kpi] || 0) - (result[director.name].comparison[kpi] || 0);
            })
        });
        return result;
    }, [periodData, comparisonData]);

    const processedDataForTable = useMemo(() => processDataForTable(filteredData, filteredComparisonData, budgets), [filteredData, filteredComparisonData, budgets, comparisonMode]);
    const allStoresProcessedData = useMemo(() => processDataForTable(periodData, comparisonData, budgets), [periodData, comparisonData, budgets, comparisonMode]);

    useEffect(() => {
        const fetchAnomalies = async () => {
            if (Object.keys(allStoresProcessedData).length > 0) {
                const detectedAnomalies = await getAnomalyDetections(allStoresProcessedData, currentPeriod.label);
                setAnomalies(detectedAnomalies);
            }
        };
        fetchAnomalies();
    }, [allStoresProcessedData, currentPeriod.label]);
    
    const handleLocationSelect = useCallback((location: string) => {
        setSelectedLocation(location);
        setLocationInsightsOpen(true);
    }, []);
    
    const handleReviewClick = useCallback((location: string) => {
        setSelectedLocation(location);
        setReviewModalOpen(true);
    }, []);

    const handleAnomalySelect = useCallback((anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setAnomalyModalOpen(true);
    }, []);

    const mainKpis: Kpi[] = [Kpi.Sales, Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews];
    
    const historicalDataForAI = useMemo(() => {
        const periods: Period[] = [];
        let current: Period | undefined = currentPeriod;
        for (let i = 0; i < 6 && current; i++) {
            periods.push(current);
            current = getPreviousPeriod(current);
        }
        
        return periods.map(p => ({
            periodLabel: p.label,
            data: aggregatePerformance(generateDataForPeriod(p))
        }));
    }, [currentPeriod]);


    const handlePrev = () => {
        const periods = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periods.findIndex(p => p.label === currentPeriod.label);
        if (currentIndex > 0) setCurrentPeriod(periods[currentIndex - 1]);
    };

    const handleNext = () => {
        const periods = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periods.findIndex(p => p.label === currentPeriod.label);
        if (currentIndex < periods.length - 1) setCurrentPeriod(periods[currentIndex + 1]);
    };

    const saveCurrentView = (name: string) => {
        const newView: SavedView = { name, period: currentPeriod, view: currentView, comparisonMode };
        setSavedViews(prev => [...prev, newView]);
    };

    const loadView = (viewToLoad: SavedView) => {
        setCurrentPeriod(viewToLoad.period);
        setComparisonMode(viewToLoad.comparisonMode);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <TimeSelector 
                period={currentPeriod} 
                comparisonMode={comparisonMode} 
                setComparisonMode={setComparisonMode}
                periodType={periodType}
                setPeriodType={setPeriodType}
                onPrev={handlePrev}
                onNext={handleNext}
                savedViews={savedViews}
                saveCurrentView={saveCurrentView}
                loadView={loadView}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {mainKpis.map(kpi => (
                    <KPICard 
                        key={kpi} 
                        title={kpi} 
                        value={aggregatedData[kpi]} 
                        variance={(aggregatedData[kpi] || 0) - (aggregatedComparisonData[kpi] || 0)}
                    />
                ))}
            </div>

            <ExecutiveSummary data={directorAggregates} view={currentView} period={currentPeriod} />
            
            <CompanyStoreRankings 
                data={processedDataForTable} 
                comparisonLabel={comparisonMode}
                onLocationSelect={handleLocationSelect}
                onReviewClick={handleReviewClick}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="lg:col-span-1 xl:col-span-2">
                     <AIAssistant data={processedDataForTable} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} userLocation={userLocation} />
                </div>
                 <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                    <NotesPanel
                        allNotes={notes}
                        addNote={onAddNote}
                        updateNote={onUpdateNote}
                        deleteNote={onDeleteNote}
                        currentView={currentView}
                        mainDashboardPeriod={currentPeriod}
                        dbStatus={dbStatus}
                        heightClass="max-h-[600px]"
                    />
                    <AIAlerts anomalies={anomalies} onSelectAnomaly={handleAnomalySelect} />
                </div>
            </div>

            <PerformanceMatrix 
                periodLabel={currentPeriod.label}
                currentView={currentView}
                allStoresData={allStoresProcessedData}
                directorAggregates={directorAggregates}
            />
            
            <LocationInsightsModal 
                isOpen={isLocationInsightsOpen} 
                onClose={() => setLocationInsightsOpen(false)}
                location={selectedLocation}
                performanceData={selectedLocation ? processedDataForTable[selectedLocation]?.actual : undefined}
                userLocation={userLocation}
            />
             <ReviewAnalysisModal
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                location={selectedLocation}
            />
            <AnomalyDetailModal 
                isOpen={isAnomalyModalOpen}
                onClose={() => setAnomalyModalOpen(false)}
                anomaly={selectedAnomaly}
            />
        </div>
    );
};
