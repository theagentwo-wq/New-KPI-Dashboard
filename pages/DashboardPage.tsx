import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Anomaly, Note, NoteCategory } from '../types';
import { KPI_CONFIG, DIRECTORS, ALL_STORES, ALL_KPIS, KPI_ICON_MAP } from '../constants';
import { getInitialPeriod, ALL_PERIODS, getPreviousPeriod, getYoYPeriod } from '../utils/dateUtils';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { Icon } from '../components/Icon';
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
import { FirebaseStatus } from '../services/firebaseService';
import { motion } from 'framer-motion';
import { Modal } from '../components/Modal';
import { ExecutiveSummaryModal } from '../components/ExecutiveSummaryModal';
import { getPerformanceData } from '../services/firebaseService';


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
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 flex justify-between items-start group hover:z-10"
        >
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <div className="text-4xl font-bold text-slate-100 mt-1">
                    <AnimatedNumberDisplay value={animatedValue} formatter={formatter} />
                </div>
                <div className={`text-sm font-semibold mt-1 ${getVarianceColor(variance)}`}>
                    {variance >= 0 ? '+' : ''}{formatDisplayValue(variance, title)}
                </div>
            </div>
            <div className="bg-slate-700 p-2 rounded-md">
                <Icon name={iconName} className="w-6 h-6 text-cyan-400" />
            </div>
        </motion.div>
    );
};

interface DashboardPageProps {
    currentView: View;
    notes: Note[];
    onAddNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => void;
    onUpdateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
    onDeleteNote: (noteId: string) => void;
    dbStatus: FirebaseStatus;
    loadedData: StorePerformanceData[];
    setLoadedData: React.Dispatch<React.SetStateAction<StorePerformanceData[]>>;
    budgets: Budget[];
    isAlertsModalOpen: boolean;
    setIsAlertsModalOpen: (isOpen: boolean) => void;
    isExecutiveSummaryOpen: boolean;
    setIsExecutiveSummaryOpen: (isOpen: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
    currentView, notes, onAddNote, onUpdateNote, onDeleteNote, dbStatus, loadedData, 
    setLoadedData, budgets, isAlertsModalOpen, setIsAlertsModalOpen,
    isExecutiveSummaryOpen, setIsExecutiveSummaryOpen 
}) => {
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isAnomalyModalOpen, setAnomalyModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | undefined>(undefined);
    const [comparisonData, setComparisonData] = useState<StorePerformanceData[]>([]);

     useEffect(() => {
        const fetchCurrentPeriodData = async () => {
            const data = await getPerformanceData(currentPeriod.startDate, currentPeriod.endDate);
            setLoadedData(data);
        };
        if (dbStatus.status === 'connected') {
            fetchCurrentPeriodData();
        }
    }, [currentPeriod, dbStatus.status, setLoadedData]);

    const comparisonPeriod = useMemo(() => {
        switch (comparisonMode) {
            case 'vs. Prior Period': return getPreviousPeriod(currentPeriod);
            case 'vs. Last Year': return getYoYPeriod(currentPeriod);
            case 'vs. Budget': return currentPeriod;
            default: return undefined;
        }
    }, [comparisonMode, currentPeriod]);

    useEffect(() => {
        const fetchComparisonData = async () => {
            if (comparisonPeriod && comparisonMode !== 'vs. Budget' && dbStatus.status === 'connected') {
                const data = await getPerformanceData(comparisonPeriod.startDate, comparisonPeriod.endDate);
                setComparisonData(data);
            } else {
                setComparisonData([]);
            }
        };
        fetchComparisonData();
    }, [comparisonPeriod, comparisonMode, dbStatus.status]);
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => { setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
            (error) => { console.warn("Geolocation permission denied:", error.message); }
        );
    }, []);

    const directorStores = useMemo(() => {
        if (currentView === 'Total Company') return ALL_STORES;
        return DIRECTORS.find(d => d.id === currentView)?.stores || [];
    }, [currentView]);

    const filteredData = useMemo(() => loadedData.filter(d => directorStores.includes(d.storeId)), [loadedData, directorStores]);
    const filteredComparisonData = useMemo(() => comparisonData.filter(d => directorStores.includes(d.storeId)), [comparisonData, directorStores]);

    const processDataForTable = useCallback((
        actualData: StorePerformanceData[],
        comparisonStoreData: StorePerformanceData[],
        budgetData: Budget[],
        mode: ComparisonMode,
        period: Period
    ) => {
        const result: { [storeId: string]: { actual: PerformanceData; comparison?: PerformanceData; variance: PerformanceData; } } = {};

        actualData.forEach(storeData => {
            const storeId = storeData.storeId;
            const actual = storeData.data;
            let comparison: PerformanceData | undefined = {};
            
            if (mode === 'vs. Budget') {
                const month = period.startDate.getMonth() + 1; // 1-12
                const year = period.startDate.getFullYear();
                const budget = budgetData.find(b => b.storeId === storeId && b.year === year && b.month === month);
                comparison = budget?.targets;
            } else {
                const comparisonStore = comparisonStoreData.find(c => c.storeId === storeId);
                comparison = comparisonStore?.data;
            }

            const variance: PerformanceData = {};
            ALL_KPIS.forEach(kpi => {
                const actualValue = actual[kpi];
                const comparisonValue = comparison?.[kpi];
                if (actualValue !== undefined && comparisonValue !== undefined) {
                    variance[kpi] = actualValue - comparisonValue;
                }
            });
            result[storeId] = { actual, comparison, variance };
        });

        return result;

    }, []);

    const allStoresProcessedData = useMemo(() => {
        return processDataForTable(loadedData, comparisonData, budgets, comparisonMode, currentPeriod);
    }, [loadedData, comparisonData, budgets, comparisonMode, currentPeriod, processDataForTable]);
    
    const processedDataForTable = useMemo(() => {
        const filtered: { [key: string]: any } = {};
        for(const storeId of directorStores) {
            if(allStoresProcessedData[storeId]){
                filtered[storeId] = allStoresProcessedData[storeId];
            }
        }
        return filtered;
    }, [directorStores, allStoresProcessedData]);

    const aggregatePerformance = useCallback((data: { [key: string]: { actual: PerformanceData } }, kpi: Kpi) => {
        const kpiConfig = KPI_CONFIG[kpi];
        const values = Object.values(data).map(d => d.actual[kpi]).filter(v => v !== undefined) as number[];
        if (values.length === 0) return 0;
        
        if (kpiConfig.format === 'currency') {
            return values.reduce((sum, v) => sum + v, 0); // Sum for currency
        }
        // Average for percentages and numbers
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }, []);

    const aggregatedData = useMemo(() => {
        const agg: PerformanceData = {};
        ALL_KPIS.forEach(kpi => {
            agg[kpi] = aggregatePerformance(processedDataForTable, kpi);
        });
        return agg;
    }, [processedDataForTable, aggregatePerformance]);
    
    const directorAggregates = useMemo(() => { /* ... logic ... */ return {}; }, [allStoresProcessedData]);


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
        setIsAlertsModalOpen(false);
    }, [setIsAlertsModalOpen]);
    
    const mainKpis: Kpi[] = [Kpi.Sales, Kpi.PrimeCost, Kpi.SOP, Kpi.AvgReviews, Kpi.CulinaryAuditScore];
    const historicalDataForAI = useMemo(() => { /* ... */ return []; }, [currentPeriod]);

    const handlePrev = () => { /* ... */ };
    const handleNext = () => { /* ... */ };
    
    const containerVariants = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                <div className="xl:col-span-3 space-y-6">
                    <CompanyStoreRankings
                         data={processedDataForTable}
                         currentView={currentView}
                         period={currentPeriod}
                         periodType={periodType}
                         setPeriodType={setPeriodType}
                         comparisonMode={comparisonMode}
                         setComparisonMode={setComparisonMode}
                         onLocationSelect={handleLocationSelect}
                         onReviewClick={handleReviewClick}
                    />
                    <NotesPanel 
                        allNotes={notes}
                        addNote={onAddNote}
                        updateNote={onUpdateNote}
                        deleteNote={onDeleteNote}
                        currentView={currentView}
                        mainDashboardPeriod={currentPeriod}
                        dbStatus={dbStatus}
                    />
                </div>
                <div className="xl:col-span-1 space-y-6 xl:sticky top-8">
                    <PerformanceMatrix periodLabel={currentPeriod.label} currentView={currentView} allStoresData={allStoresProcessedData} directorAggregates={directorAggregates} />
                    <AIAssistant data={processedDataForTable} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} userLocation={userLocation} />
                </div>
            </div>
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
             <Modal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} title="AI Anomaly Detections">
                <AIAlerts anomalies={anomalies} onSelectAnomaly={handleAnomalySelect} />
            </Modal>
            <AnomalyDetailModal 
                isOpen={isAnomalyModalOpen}
                onClose={() => setAnomalyModalOpen(false)}
                anomaly={selectedAnomaly}
            />
            <ExecutiveSummaryModal 
                isOpen={isExecutiveSummaryOpen}
                onClose={() => setIsExecutiveSummaryOpen(false)}
                data={directorAggregates}
                view={currentView}
                period={currentPeriod}
            />
        </div>
    );
};