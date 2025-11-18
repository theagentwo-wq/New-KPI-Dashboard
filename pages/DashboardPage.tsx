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

    const aggregatePerformance = (data: StorePerformanceData[]): PerformanceData => { /* ... */ return {}; };
    const aggregatedData = useMemo(() => aggregatePerformance(filteredData), [filteredData]);
    const aggregatedComparisonData = useMemo(() => aggregatePerformance(filteredComparisonData), [filteredComparisonData]);
    const processDataForTable = ( /* ... */ ) => { return {} };
    const directorAggregates = useMemo(() => { /* ... */ return {}; }, []);
    const processedDataForTable = useMemo(() => processDataForTable(), []);
    const allStoresProcessedData = useMemo(() => processDataForTable(), []);

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
                    {/* ... KPICards, CompanyStoreRankings, NotesPanel ... */}
                </div>
                <div className="xl:col-span-1 space-y-6 xl:sticky top-8">
                    <PerformanceMatrix periodLabel={currentPeriod.label} currentView={currentView} allStoresData={allStoresProcessedData} directorAggregates={directorAggregates} />
                    <AIAssistant data={processedDataForTable} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} userLocation={userLocation} />
                </div>
            </div>
            {/* ... Modals ... */}
        </div>
    );
};
