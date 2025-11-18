import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Anomaly, Note, NoteCategory, DataItem } from '../types';
import { KPI_CONFIG, DIRECTORS, ALL_STORES, ALL_KPIS } from '../constants';
import { getInitialPeriod, getPreviousPeriod, getYoYPeriod } from '../utils/dateUtils';
import { AIAssistant } from '../components/AIAssistant';
import { NotesPanel } from '../components/NotesPanel';
import { LocationInsightsModal } from '../components/LocationInsightsModal';
import { CompanyStoreRankings } from '../components/CompanyStoreRankings';
import { AIAlerts } from '../components/AIAlerts';
import { AnomalyDetailModal } from '../components/AnomalyDetailModal';
import { ReviewAnalysisModal } from '../components/ReviewAnalysisModal';
import { PerformanceMatrix } from '../components/PerformanceMatrix';
import { FirebaseStatus } from '../services/firebaseService';
import { Modal } from '../components/Modal';
import { ExecutiveSummaryModal } from '../components/ExecutiveSummaryModal';
import { getPerformanceData } from '../services/firebaseService';

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
    const [currentPeriod, _setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [anomalies, _setAnomalies] = useState<Anomaly[]>([]);

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
    
    // FIX: Replaced a large block of corrupted and duplicated code with the correct useEffect for geolocation.
    // This resolves multiple syntax and runtime errors that prevented the component from rendering.
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
                const month = period.startDate.getUTCMonth() + 1; // 1-12
                const year = period.startDate.getUTCFullYear();
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

    const directorAggregates = useMemo(() => { 
        const directorData: { [key: string]: DataItem} = {};
        DIRECTORS.forEach(d => {
            const directorStoreIds = d.stores;
            const directorStoreData = directorStoreIds.reduce((acc, storeId) => {
                if(allStoresProcessedData[storeId]) {
                    acc[storeId] = allStoresProcessedData[storeId];
                }
                return acc;
            }, {} as typeof allStoresProcessedData);

            const aggregated: { actual: PerformanceData, comparison: PerformanceData, variance: PerformanceData } = {
                actual: {}, comparison: {}, variance: {}
            };

            // FIX: Explicitly type the value from Object.values to prevent `unknown` type error.
            type StoreProcessedData = (typeof allStoresProcessedData)[string];

            ALL_KPIS.forEach(kpi => {
                 const kpiConfig = KPI_CONFIG[kpi];
                 const actualValues = Object.values(directorStoreData).map((s: StoreProcessedData) => s.actual[kpi]).filter(v => v !== undefined) as number[];
                 const comparisonValues = Object.values(directorStoreData).map((s: StoreProcessedData) => s.comparison?.[kpi]).filter(v => v !== undefined) as number[];
                
                if (kpiConfig.format === 'currency') {
                    aggregated.actual[kpi] = actualValues.reduce((a, b) => a + b, 0);
                    aggregated.comparison[kpi] = comparisonValues.reduce((a, b) => a + b, 0);
                } else {
                    aggregated.actual[kpi] = actualValues.length > 0 ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length : 0;
                    aggregated.comparison[kpi] = comparisonValues.length > 0 ? comparisonValues.reduce((a, b) => a + b, 0) / comparisonValues.length : 0;
                }
                if(aggregated.actual[kpi] !== undefined && aggregated.comparison[kpi] !== undefined) {
                    aggregated.variance[kpi] = aggregated.actual[kpi]! - aggregated.comparison[kpi]!;
                }
            });
            directorData[d.id] = { aggregated: aggregated.actual, comparison: aggregated.comparison, variance: aggregated.variance };
        });
        return directorData;
    }, [allStoresProcessedData]);

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
    
    const historicalDataForAI = useMemo(() => { /* ... */ return []; }, []);

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
