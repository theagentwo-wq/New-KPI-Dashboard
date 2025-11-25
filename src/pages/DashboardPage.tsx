import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Anomaly, Note, NoteCategory, DataItem, DirectorProfile, Kpi } from '../types';
import { KPI_CONFIG, DIRECTORS, ALL_STORES } from '../constants';
import { getInitialPeriod, getPreviousPeriod, getYoYPeriod, ALL_PERIODS } from '../utils/dateUtils';
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
import { getPerformanceData, getBudgets } from '../services/firebaseService';
import { KPISummaryCards } from '../components/KPISummaryCards';

interface DashboardPageProps {
    activePeriod: Period;
    activeView: View;
    notes: Note[];
    onAddNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => void;
    onUpdateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
    onDeleteNote: (noteId: string) => void;
    loadedData: StorePerformanceData[];
    setLoadedData: React.Dispatch<React.SetStateAction<StorePerformanceData[]>>;
    budgets: Budget[];
    isAlertsModalOpen: boolean;
    setIsAlertsModalOpen: (isOpen: boolean) => void;
    isExecutiveSummaryOpen: boolean;
    setIsExecutiveSummaryOpen: (isOpen: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
    activePeriod, activeView, notes, onAddNote, onUpdateNote, onDeleteNote, loadedData, 
    setLoadedData, budgets: initialBudgets, isAlertsModalOpen, setIsAlertsModalOpen,
    isExecutiveSummaryOpen, setIsExecutiveSummaryOpen 
}) => {
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [anomalies, _setAnomalies] = useState<Anomaly[]>([]);
    const [selectedKpi, setSelectedKpi] = useState<Kpi>(Kpi.Sales);
    const [fetchedBudgets, setFetchedBudgets] = useState<Budget[]>(initialBudgets);

    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isAnomalyModalOpen, setAnomalyModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | undefined>(undefined);
    const [comparisonData, setComparisonData] = useState<StorePerformanceData[]>([]);

    const comparisonPeriod = useMemo(() => {
        switch (comparisonMode) {
            case 'vs. Prior Period': return getPreviousPeriod(activePeriod);
            case 'vs. Last Year': return getYoYPeriod(activePeriod);
            case 'vs. Budget': return activePeriod;
            default: return undefined;
        }
    }, [comparisonMode, activePeriod]);

    useEffect(() => {
        const fetchComparisonData = async () => {
            if (comparisonPeriod && comparisonMode !== 'vs. Budget') {
                const data = await getPerformanceData(comparisonPeriod.startDate, comparisonPeriod.endDate);
                setComparisonData(data);
            } else {
                setComparisonData([]);
            }
        };
        fetchComparisonData();
    }, [comparisonPeriod, comparisonMode]);
    
    useEffect(() => {
        const today = new Date();
        const relevantPeriods = ALL_PERIODS.filter((p: Period) => p.type === periodType);
        const newPeriod = relevantPeriods.find((p: Period) => today >= p.startDate && today <= p.endDate) || relevantPeriods[relevantPeriods.length - 1];
    }, [periodType]);

    const periodsForType = useMemo(() => {
        return ALL_PERIODS.filter((p: Period) => p.type === periodType);
    }, [periodType]);

    const currentPeriodIndex = useMemo(() => {
        return periodsForType.findIndex((p: Period) => p.label === activePeriod.label);
    }, [periodsForType, activePeriod]);

    const handlePreviousPeriod = () => {
        if (currentPeriodIndex > 0) {
        }
    };

    const handleNextPeriod = () => {
        if (currentPeriodIndex < periodsForType.length - 1) {
        }
    };

    const handleResetView = useCallback(() => {
        setPeriodType('Week');
        setComparisonMode('vs. Prior Period');
        setSelectedKpi(Kpi.Sales);
    }, []);

    const isPrevPeriodDisabled = currentPeriodIndex <= 0;
    const isNextPeriodDisabled = currentPeriodIndex >= periodsForType.length - 1;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => { setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
            (error) => { console.warn("Geolocation permission denied:", error.message); }
        );
    }, []);

    const directorStores = useMemo(() => {
        if (activeView === 'Total Company') return ALL_STORES;
        return DIRECTORS.find((d: DirectorProfile) => d.id === activeView)?.stores || [];
    }, [activeView]);

    const processDataForTable = useCallback((
        actualData: StorePerformanceData[],
        comparisonStoreData: StorePerformanceData[],
        budgetData: Budget[],
        mode: ComparisonMode,
        period: Period
    ) => {
        // Aggregation Helper: Sums currency/counts, Averages percentages
        const aggregateList = (list: StorePerformanceData[]) => {
            const storeMap: { [id: string]: { sums: PerformanceData, counts: { [k in Kpi]?: number } } } = {};
            
            list.forEach(item => {
                const { storeId, data } = item;
                if (!storeMap[storeId]) {
                    storeMap[storeId] = { sums: {}, counts: {} };
                }
                
                (Object.keys(data) as Kpi[]).forEach(kpi => {
                    const value = data[kpi];
                    if (value !== undefined) {
                        storeMap[storeId].sums[kpi] = (storeMap[storeId].sums[kpi] || 0) + value;
                        storeMap[storeId].counts[kpi] = (storeMap[storeId].counts[kpi] || 0) + 1;
                    }
                });
            });

            const result: { [id: string]: PerformanceData } = {};
            Object.keys(storeMap).forEach(storeId => {
                const { sums, counts } = storeMap[storeId];
                result[storeId] = {};
                (Object.keys(sums) as Kpi[]).forEach(kpi => {
                    const config = KPI_CONFIG[kpi];
                    if (config.format === 'currency') {
                        // Sum for currency (Sales)
                        result[storeId]![kpi] = sums[kpi];
                    } else {
                        // Average for percentages/numbers (SOP, Prime Cost, Reviews)
                        const count = counts[kpi] || 1;
                        result[storeId]![kpi] = (sums[kpi] || 0) / count;
                    }
                });
            });
            return result;
        };

        const actualsAggregated = aggregateList(actualData);
        const comparisonsAggregated = aggregateList(comparisonStoreData);

        // Budget Aggregation
        let budgetAggregated: { [id: string]: PerformanceData } = {};
        if (mode === 'vs. Budget') {
             // Identify budgets that fall within the period's date range
             const relevantBudgets = budgetData.filter(b => {
                 // Construct a date for the middle of the budget month to check overlap
                 const budgetDate = new Date(b.year, b.month - 1, 15); 
                 return budgetDate >= period.startDate && budgetDate <= period.endDate;
             });

             const storeBudgetMap: { [id: string]: { sums: PerformanceData, counts: { [k in Kpi]?: number } } } = {};
             relevantBudgets.forEach(b => {
                 const { storeId, targets } = b;
                 if (!storeBudgetMap[storeId]) storeBudgetMap[storeId] = { sums: {}, counts: {} };
                 (Object.keys(targets) as Kpi[]).forEach(kpi => {
                     const val = targets[kpi];
                     if (val !== undefined) {
                         storeBudgetMap[storeId].sums[kpi] = (storeBudgetMap[storeId].sums[kpi] || 0) + val;
                         storeBudgetMap[storeId].counts[kpi] = (storeBudgetMap[storeId].counts[kpi] || 0) + 1;
                     }
                 });
             });
             
             Object.keys(storeBudgetMap).forEach(storeId => {
                const { sums, counts } = storeBudgetMap[storeId];
                budgetAggregated[storeId] = {};
                (Object.keys(sums) as Kpi[]).forEach(kpi => {
                    const config = KPI_CONFIG[kpi];
                    if (config.format === 'currency') {
                        budgetAggregated[storeId]![kpi] = sums[kpi];
                    } else {
                        const count = counts[kpi] || 1;
                        budgetAggregated[storeId]![kpi] = (sums[kpi] || 0) / count;
                    }
                });
            });
        }

        const finalResult: { [storeId: string]: { actual: PerformanceData; comparison?: PerformanceData; variance: PerformanceData; } } = {};
        
        // Use actuals as the base key set.
        Object.keys(actualsAggregated).forEach(storeId => {
            const actual = actualsAggregated[storeId];
            let comparison: PerformanceData | undefined;

            if (mode === 'vs. Budget') {
                comparison = budgetAggregated[storeId];
            } else {
                comparison = comparisonsAggregated[storeId];
            }

            const variance: PerformanceData = {};
            (Object.keys(actual) as Kpi[]).forEach(kpi => {
                const actualValue = actual[kpi];
                const comparisonValue = comparison?.[kpi];
                
                if (actualValue !== undefined && comparisonValue !== undefined) {
                    // Simple subtraction for variance
                    variance[kpi] = actualValue - comparisonValue;
                }
            });

            finalResult[storeId] = { actual, comparison, variance };
        });

        return finalResult;

    }, []);

    const allStoresProcessedData = useMemo(() => {
        return processDataForTable(loadedData, comparisonData, fetchedBudgets, comparisonMode, activePeriod);
    }, [loadedData, comparisonData, fetchedBudgets, comparisonMode, activePeriod, processDataForTable]);
    
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
        DIRECTORS.forEach((d: DirectorProfile) => {
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

            type StoreProcessedData = (typeof allStoresProcessedData)[string];

            Object.values(Kpi).forEach(kpi => {
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

    const summaryDataForCards = useMemo(() => {
        if (activeView === 'Total Company') {
            const aggregated: PerformanceData = {};
            Object.values(Kpi).forEach(kpi => {
                const kpiConfig = KPI_CONFIG[kpi];
                const values = Object.values(allStoresProcessedData).map(d => d.actual[kpi]).filter(v => v !== undefined) as number[];
                if (values.length === 0) return;

                if (kpiConfig.format === 'currency') {
                    aggregated[kpi] = values.reduce((sum, v) => sum + v, 0);
                } else {
                    aggregated[kpi] = values.reduce((sum, v) => sum + v, 0) / values.length;
                }
            });
            return aggregated;
        }
        
        const directorData = directorAggregates[activeView];
        if (directorData && 'aggregated' in directorData) {
            return directorData.aggregated;
        }
        return undefined;
    }, [activeView, allStoresProcessedData, directorAggregates]);

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
            <div className="mb-6">
                <KPISummaryCards 
                    data={summaryDataForCards}
                    selectedKpi={selectedKpi}
                    onKpiSelect={setSelectedKpi}
                    period={activePeriod}
                    view={activeView}
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                <div className="xl:col-span-3 space-y-6">
                    <CompanyStoreRankings
                         data={processedDataForTable}
                         selectedKpi={selectedKpi}
                         currentView={activeView}
                         period={activePeriod}
                         periodType={periodType}
                         setPeriodType={setPeriodType}
                         comparisonMode={comparisonMode}
                         setComparisonMode={setComparisonMode}
                         onLocationSelect={handleLocationSelect}
                         onReviewClick={handleReviewClick}
                         onPrevPeriod={handlePreviousPeriod}
                         onNextPeriod={handleNextPeriod}
                         isPrevPeriodDisabled={isPrevPeriodDisabled}
                         isNextPeriodDisabled={isNextPeriodDisabled}
                         onResetView={handleResetView}
                    />
                    <NotesPanel 
                        allNotes={notes}
                        addNote={onAddNote}
                        updateNote={onUpdateNote}
                        deleteNote={onDeleteNote}
                        currentView={activeView}
                        mainDashboardPeriod={activePeriod}
                    />
                </div>
                <div className="xl:col-span-1 space-y-6 xl:sticky top-8">
                    <PerformanceMatrix periodLabel={activePeriod.label} currentView={activeView} allStoresData={allStoresProcessedData} directorAggregates={directorAggregates} />
                    <AIAssistant data={processedDataForTable} historicalData={historicalDataForAI} view={activeView} period={activePeriod} userLocation={userLocation} />
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
                onClose={() => { setAnomalyModalOpen(false); setSelectedAnomaly(undefined); }}
                anomaly={selectedAnomaly}
            />
            <ExecutiveSummaryModal 
                isOpen={isExecutiveSummaryOpen}
                onClose={() => setIsExecutiveSummaryOpen(false)}
                data={directorAggregates}
                view={activeView}
                period={activePeriod}
            />
        </div>
    );
};